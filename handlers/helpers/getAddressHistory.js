const getAddressTransactions = require('./getAddressTransactions');
const BigNumber = require('bignumber.js');
const denominate = require('./denominate');
const e = require('cors');
const genesis = require('./genesis.json');
const {getEpoch} = require('./getEpoch');

function hexToDec(hex) {
  return hex
    .toLowerCase()
    .split('')
    .reduce((result, ch) => result * 16 + '0123456789abcdefgh'.indexOf(ch), 0);
}

const getAddressHistory = async (query) => {
  let data = await getAddressTransactions(query);

  // return data;
  let wallet = {
    history: {},
    staked: {},
    claimable: new BigNumber('0'),
    available: new BigNumber('0'),
    unDelegated: {},
    count: data.transactions.length,
    fees: new BigNumber('0'),
    epochHistoryStaked: {},
  };

  if (query.address in genesis) {
    wallet.available = wallet.available.plus( new BigNumber(genesis[query.address].balance))
    if (genesis[query.address].delegation.address != '') {
      wallet.staked[genesis[query.address].delegation.address] = new BigNumber(genesis[query.address].delegation.value);
    }

  }
  for (const transaction of data['transactions']) {
    let entry = null;
    const epochTX = getEpoch(transaction.timestamp);
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
                      new BigNumber(transaction.value)
                    );
                    if (!wallet.epochHistoryStaked[epochTX]) {
                      wallet.epochHistoryStaked[epochTX] = {
                        staked: { [transaction.receiver]: wallet.staked[transaction.receiver] },
                      };
                    } else {
                      if (!wallet.epochHistoryStaked[epochTX].staked[transaction.receiver]) {
                        wallet.epochHistoryStaked[epochTX].staked[transaction.receiver] =
                          wallet.staked[transaction.receiver];
                      } else {
                        wallet.epochHistoryStaked[epochTX].staked[transaction.receiver] =
                          wallet.staked[transaction.receiver];
                      }
                    }
                  } else {
                    wallet.staked[transaction.receiver] = new BigNumber(transaction.value);
                    if (!wallet.epochHistoryStaked[epochTX]) {
                      wallet.epochHistoryStaked[epochTX] = {
                        staked: { [transaction.receiver]: new BigNumber(transaction.value) },
                      };
                    } else {
                      wallet.epochHistoryStaked[epochTX].staked = {
                        ...wallet.epochHistoryStaked[epochTX].staked,
                        [transaction.receiver]: new BigNumber(transaction.value),
                      };
                    }
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
                    if (!wallet.epochHistoryStaked[epochTX]) {
                      wallet.epochHistoryStaked[epochTX] = {
                        staked: { [transaction.receiver]: wallet.staked[transaction.receiver] },
                      };
                    } else {
                      if (!wallet.epochHistoryStaked[epochTX].staked[transaction.receiver]) {
                        wallet.epochHistoryStaked[epochTX].staked[transaction.receiver] =
                          wallet.staked[transaction.receiver];
                      } else {
                        wallet.epochHistoryStaked[epochTX].staked[transaction.receiver] =
                          wallet.staked[transaction.receiver];
                      }
                    }
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
                if ((scTX.data === undefined && scTX.value.charAt(0) != '-') 
                   || (scTX.data == '')) {
                  wallet.available = wallet.available.plus(new BigNumber(scTX.value));
                } else if (scTX.data == '@ok' && transaction.fee.charAt(0) == '-') {
                  fee = fee.plus(new BigNumber(scTX.value));
                }
              });
            }
            entry.value = TmpValueClaim.toFixed();
            break;
          case 'unDelegate':
            if (transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data == '@ok' && scTX.value > 0) {
                  if (!wallet.unDelegated[transaction.receiver]) {
                    wallet.unDelegated[transaction.receiver] = new BigNumber(0);
                  }
                  wallet.unDelegated[transaction.receiver] = wallet.unDelegated[
                    transaction.receiver
                  ].plus(transaction.value);
                  wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].minus(
                    transaction.value
                  );
                  if (!wallet.epochHistoryStaked[epochTX]) {
                    wallet.epochHistoryStaked[epochTX] = {
                      staked: { [transaction.receiver]: wallet.staked[transaction.receiver] },
                    };
                  } else {
                    if (!wallet.epochHistoryStaked[epochTX].staked[transaction.receiver]) {
                      wallet.epochHistoryStaked[epochTX].staked[transaction.receiver] =
                        wallet.staked[transaction.receiver];
                    } else {
                      wallet.epochHistoryStaked[epochTX].staked[transaction.receiver] =
                        wallet.staked[transaction.receiver];
                    }
                  }
                }
              });
            }
            break;
          case 'withdraw':
            if (transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data === undefined && scTX.value > 0) {
                  wallet.unDelegated[transaction.receiver] = wallet.unDelegated[
                    transaction.receiver
                  ].minus(new BigNumber(scTX.value));
                  wallet.available = wallet.available.plus(new BigNumber(scTX.value));
                }
              });
            }
            break;
          case 'createNewDelegationContract':
            var agency = '';
            transaction.scResults.forEach((scTX) => {
              if (scTX.data !== undefined) {
                agency = scTX.data.split('@')[2];
                wallet.available = wallet.available.plus(new BigNumber(scTX.value));
              }
            });
            wallet.epochHistoryStaked[epochTX] = {
              staked: {
                [agency]: new BigNumber(transaction.value),
              },
            };
            wallet.available = wallet.available.minus(new BigNumber(transaction.value));
            wallet.staked = {
              [agency]: new BigNumber(transaction.value),
            };
            break;
          case 'stake':
            if (transaction.scResults && transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data === '@ok') {
                  fee = new BigNumber('57000000000000');
                }
              });
              wallet.available = wallet.available.minus(new BigNumber(transaction.value));
              if (!(transaction.receiver in wallet.staked)) {
                wallet.staked[transaction.receiver] = new BigNumber(transaction.value);
              } else {
                wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].plus(
                  new BigNumber(transaction.value)
                );
              }
            }
            break;
          case 'unStake':
            if (transaction.scResults && transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (
                  scTX.data === '@ok' &&
                  transaction.receiver ==
                  'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt'
                ) {
                  fee = new BigNumber('89000000000000');
                  var value = new BigNumber(transaction.value);
                  if (!(transaction.receiver in wallet.unDelegated)) {
                    console.log(transaction);
                    wallet.unDelegated[transaction.receiver] = value;
                  } else {
                    wallet.unDelegated[transaction.receiver] = wallet.unDelegated[
                      transaction.receiver
                    ].plus(value);
                  }
                  if (wallet.staked[transaction.receiver]) {
                    wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].minus(
                      value
                    );
                  }
                }
              });
              if (
                transaction.receiver ==
                'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l'
              ) {
                let sizeData = transaction.data.split('@');
                let nodesUnstaked = sizeData.length;
                if (wallet.staked[transaction.receiver]) {
                  wallet.staked[transaction.receiver] = wallet.staked[transaction.receiver].minus(
                    new BigNumber(2500000000000000000000).multipliedBy(nodesUnstaked)
                  );
                }
              }
            }

            break;
          case 'unBond':
            if (transaction.scResults && transaction.scResults.length > 0) {
              // console.log(transaction);
              transaction.scResults.forEach((scTX) => {
                if (scTX.data && scTX.data.includes('@ok')) {
                  let sizeData = scTX.data.split('@');
                  if (sizeData.length > 2) {
                    console.log(new BigNumber(hexToDec(sizeData[2])).toFixed());
                    wallet.available = wallet.available.plus(new BigNumber(hexToDec(sizeData[2])));
                  }
                  fee = new BigNumber('59000000000000');
                } else if (
                  scTX.data === '' &&
                  transaction.receiver ==
                  'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt'
                ) {
                  wallet.unDelegated[transaction.receiver] = wallet.unDelegated[
                    transaction.receiver
                  ].minus(new BigNumber(scTX.value));
                  wallet.available = wallet.available.plus(new BigNumber(scTX.value));
                } else if (
                  scTX.data == undefined &&
                  transaction.receiver ==
                  'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l'
                ) {
                  console.log(scTX.value);
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
      if (transaction.receiver !== null) {
        if (fee != undefined) {
          wallet.fees = wallet.fees.plus(fee);
          wallet.available = wallet.available.minus(fee);
        }
        entry.fee = fee ? await denominate({ input: fee }) : fee;
      }
      entry.value = denominate({ input: entry.value });
      entry.staked = JSON.parse(JSON.stringify(wallet.staked));
      entry.claimable = denominate({ input: wallet.claimable.toFixed() });
      entry.available = denominate({ input: wallet.available.toFixed() });
      entry.unDelegated = JSON.parse(JSON.stringify(wallet.unDelegated));
      entry.epoch = epochTX;
      entry.fees = denominate({ input: wallet.fees.toFixed() });

      Object.keys(entry.staked).forEach(function (address, value) {
        entry.staked[address] = denominate({
          input: new BigNumber(entry.staked[address]).toFixed(),
        });
      });

      Object.keys(entry.unDelegated).forEach(function (address, value) {
        entry.unDelegated[address] = denominate({
          input: new BigNumber(entry.unDelegated[address]).toFixed(),
        });
      });

      if (!wallet.history[epochTX]) {
        wallet.history[epochTX] = { [transaction.timestamp]: entry };
      } else {
        wallet.history[epochTX] = { [transaction.timestamp]: entry, ...wallet.history[epochTX] };
      }
    }
  }

  Object.keys(wallet.staked).forEach(function (address) {
    if ( wallet.staked[address].lte(new BigNumber(0.0))) {
      delete wallet.staked[address];
    } else {
      wallet.staked[address] = denominate({ input: wallet.staked[address].toFixed() });
    }
  });

  wallet.claimable = denominate({ input: wallet.claimable.toFixed() });

  wallet.available = denominate({ input: wallet.available.toFixed() });

  Object.keys(wallet.unDelegated).forEach(function (address) {
    if ( wallet.unDelegated[address].lte(new BigNumber(0.0))) {
      delete wallet.unDelegated[address];
    } else {
      wallet.unDelegated[address] = denominate({ input: wallet.unDelegated[address].toFixed() });
    }

  });
  Object.keys(wallet.epochHistoryStaked).forEach(function (epoch) {
    Object.keys(wallet.epochHistoryStaked[epoch].staked).forEach((address) => {
      wallet.epochHistoryStaked[epoch].staked[address] = denominate({
        input: wallet.epochHistoryStaked[epoch].staked[address].toFixed(),
      });
    });
  });
  wallet.fees = denominate({ input: wallet.fees.toFixed() });
  return wallet;
};

module.exports = getAddressHistory;
