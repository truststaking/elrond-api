const getAddressTransactions = require('./getAddressTransactions');
const BigNumber = require('bignumber.js');
const denominate = require('./denominate');

const getAddressHistory = async (query) => {
  let data = await getAddressTransactions({
    address: query.address,
    before: query.before,
  });

  // return data;
  let wallet = {
    history: {},
    staked: {},
    claimable: new BigNumber('0'),
    available: new BigNumber('0'),
    unDelegated: {},
    count: data.transactions.length,
    fees: new BigNumber('0'),
  };

  for (const transaction of data['transactions']) {
    let entry = null;
    let fee = transaction.fee ? new BigNumber(transaction.fee) : transaction.fee;
    if (transaction.receiver !== null) {

      if (transaction.scResults !== null) {
        let command = null;
        if (transaction.data !== null) {
          command = transaction.data.split('@')[0];
        }
        entry = {
          data: command,
          agency: transaction.receiver,
          txHash: transaction.txHash,
          value: transaction.value,
        };
        switch (command) {
          case 'delegate':
            // eslint-disable-next-line no-case-declarations
            let TmpValueDel = new BigNumber('0');
            if (transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                TmpValueDel = TmpValueDel.plus(new BigNumber(scTX.value));
                if (scTX.data === undefined) {
                  if (wallet.staked[transaction.receiver]) {
                    wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].plus(
                      new BigNumber(scTX.value)
                    );
                  } else {
                    wallet.staked[transaction.receiver] = new BigNumber(scTX.value);
                  }
                }
              });
            }
            entry.value = TmpValueDel.toFixed();
            wallet.available = wallet.available.minus(new BigNumber(transaction.value));
            break;
          case 'reDelegateRewards':
            // eslint-disable-next-line no-case-declarations
            let TmpValueRe = new BigNumber('0');
            if (transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                TmpValueRe = TmpValueRe.plus(new BigNumber(scTX.value));
                if (scTX.data === undefined) {
                  if (wallet.staked[transaction.receiver]) {
                    wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].plus(
                      new BigNumber(scTX.value)
                    );
                  } else {
                    wallet.staked[transaction.receiver] = new BigNumber(scTX.value);
                  }
                }
              });
            }
            entry.value = TmpValueRe.toFixed();
            break;
          case 'claimRewards':
            // eslint-disable-next-line no-case-declarations
            let TmpValueClaim = new BigNumber('0');
            if (transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                TmpValueClaim = TmpValueClaim.plus(new BigNumber(scTX.value));
                if (scTX.data === undefined) {
                  wallet.available = wallet.available.plus(new BigNumber(scTX.value));
                }
              });
            }
            entry.value = TmpValueClaim.toFixed();
            break;
          case 'unDelegate':
            if (transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data === undefined) {
                  wallet.unDelegated = wallet.unDelegated.plus(new BigNumber(scTX.value));
                  wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].minus(
                    new BigNumber(scTX.value)
                  );
                }
              });
            }
            break;
          case 'withdraw':
            if (transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data === undefined) {
                  wallet.unDelegated = wallet.unDelegated.minus(new BigNumber(scTX.value));
                  wallet.available = wallet.available.plus(new BigNumber(scTX.value));
                }
              });
            }
            break;
          case 'createNewDelegationContract':
            transaction.scResults.forEach((scTX) => {
              if (scTX.data !== undefined) {
                //find agency
                wallet.available = wallet.available.plus(new BigNumber(scTX.value));
              }
            });
            wallet.available = wallet.available.minus(new BigNumber(transaction.value));
            //update wallet.staked[agency] -> agency will be taken from scTX data
            break;
          case 'stake':
            if (transaction.scResults && transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data === '@ok') {
                  // if (fee < 0) {
                  //   fee = fee.plus(new BigNumber(scTX.value));
                  // }
                  // else {
                  //   fee = fee.minus(new BigNumber(scTX.value));
                  // }
                  fee = new BigNumber("57000000000000");

                } else if (scTX.data === undefined) {
                  wallet.available = wallet.available.minus(new BigNumber(scTX.value));
                  if (!(transaction.receiver in wallet.staked)) {
                    wallet.staked[transaction.receiver] = new BigNumber(scTX.value);
                  } else {
                    wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].plus(
                      new BigNumber(scTX.value)
                    );
                  }
                }
              });
            }
            break;
          case 'unStake':
            if (transaction.scResults && transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data === '@ok') {
                  fee = new BigNumber("89000000000000");
                  // eslint-disable-next-line no-case-declarations
                  let value = new BigNumber(transaction.value);

                  if (value.gt(wallet.staked[transaction.receiver].toFixed()))
                  {
                    value = wallet.staked[transaction.receiver];
                    transaction.value = value;
                  }
                  if (!(transaction.receiver in wallet.unDelegated)) {
                    wallet.unDelegated[transaction.receiver] = value;
                  } else {
                    wallet.unDelegated[transaction.receiver] = wallet.unDelegated[
                      transaction.receiver
                    ].plus(value.toFixed());
                  }
                  wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].minus(value.toFixed());
                }
              });
            }
            break;
          case 'unBond':
            console.log(transaction);
            if (transaction.scResults && transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data === '@ok') {
                  fee = new BigNumber("59000000000000");
                }
                else if (scTX.data === '') {
                  wallet.unDelegated[transaction.receiver] = wallet.unDelegated[transaction.receiver].minus(new BigNumber(scTX.value));
                  wallet.available = wallet.available.plus(new BigNumber(scTX.value));
                }
              });
            }
            break;

          default:
            console.log('warning: unknown transaction: ' + command);
            break;
        }
      } else {
        entry = {
          receiver: transaction.receiver,
          txHash: transaction.txHash,
          value: transaction.value,
        };
        wallet.available = wallet.available.minus(new BigNumber(transaction.value));
      }
    } else if (transaction.sender !== null && transaction.scResults === null) {
      entry = {
        sender: transaction.sender,
        txHash: transaction.txHash,
        value: transaction.value,
      };
      wallet.available = wallet.available.plus(new BigNumber(transaction.value));
    } else {
      console.log('warning: unknown transaction');
    }
    if (entry !== null) {
      if (fee != undefined) {
        wallet.fees = wallet.fees.plus(fee);
        wallet.available = wallet.available.minus(fee);
      }
      entry.value = denominate({ input: entry.value });
      entry.fee = fee ? await denominate({ input: fee }) : fee;
      entry.staked = JSON.parse(JSON.stringify(wallet.staked));
      entry.claimable = denominate({ input: wallet.claimable.toFixed() });
      entry.available = denominate({ input: wallet.available.toFixed() });
      entry.unDelegated = JSON.parse(JSON.stringify(wallet.unDelegated));
      entry.fees = denominate({ input: wallet.fees.toFixed() });


      entry.staked = Object.keys(entry.staked).map((address) => {
        let value = denominate({ input: new BigNumber(entry.staked[address]).toFixed() });
        return { [address]: value };
      });

      entry.unDelegated = Object.keys(entry.unDelegated).map((address) => {
        let value = denominate({ input: new BigNumber(entry.unDelegated[address]).toFixed() });
        return { [address]: value };
      });




      wallet.history[transaction.timestamp] = entry;
    }
  }

  wallet.staked = Object.keys(wallet.staked).map((address) => {
    let value = denominate({ input: wallet.staked[address].toFixed() });
    return { [address]: value };
  });

  wallet.claimable = denominate({ input: wallet.claimable.toFixed() });

  wallet.available = denominate({ input: wallet.available.toFixed() });

  wallet.unDelegated = Object.keys(wallet.unDelegated).map((address) => {
    let value = denominate({ input: wallet.unDelegated[address].toFixed() });
    return { [address]: value };
  });

  wallet.history = Object.keys(wallet.history).map((timestamp) => {
    const stakedResult = Object.keys(wallet.history[timestamp].staked).map((address) => {
      let value = wallet.history[timestamp].staked[address]
      return { [address]: value };
    });
    return { ...wallet.history[timestamp], staked: stakedResult };
  });

  wallet.fees = denominate({ input: wallet.fees.toFixed() });
  return wallet;
};

module.exports = getAddressHistory;
