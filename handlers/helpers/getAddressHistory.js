const getAddressTransactions = require('./getAddressTransactions');
const BigNumber = require('bignumber.js');
const denominate = require('./denominate');
const e = require('express');

const getAddressHistory = async (query) => {
  let data = await getAddressTransactions({
    address: query.address,
    before: query.before,
  });

  // return data;
  let wallet = {
    history: {},
    staked: new BigNumber('0'),
    claimable: new BigNumber('0'),
    available: new BigNumber('0'),
    unDelegated: new BigNumber('0'),
    count: data.transactions.length,
    fees: new BigNumber('0'),
  };

  for (const transaction of data['transactions']) {
    let entry = null;

    if (transaction.receiver !== null) {
      wallet.fees = wallet.fees.plus(Math.abs(new BigNumber(transaction.fee)));
      wallet.available = wallet.available.minus(new BigNumber(Math.abs(transaction.fee)));

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
          fee: Math.abs(transaction.fee),
        };
        switch (command) {
          case 'delegate':
            // eslint-disable-next-line no-case-declarations
            let TmpValueDel = new BigNumber('0');
            if (transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                TmpValueDel = TmpValueDel.plus(new BigNumber(scTX.value));
                if (scTX.data === undefined) {
                  wallet.staked = wallet.staked.plus(new BigNumber(scTX.value));
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
                  wallet.staked = wallet.staked.plus(new BigNumber(scTX.value));
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
                  wallet.staked = wallet.staked.minus(new BigNumber(scTX.value));
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
            wallet.available = wallet.available.minus(new BigNumber(transaction.value));
            wallet.staked = wallet.staked.plus(new BigNumber(transaction.value));
            break;
          case 'stake':
            if (transaction.scResults && transaction.scResults.length > 0) {
              transaction.scResults.forEach((scTX) => {
                if (scTX.data === '@ok') {
                  wallet.fees = wallet.fees.minus(new BigNumber(Math.abs(scTX.value)));
                  wallet.available = wallet.available.plus(new BigNumber(Math.abs(scTX.value)));
                }
              });
            }
            break;
          default:
            console.log('warning: unknown transaction');
            break;
        }
      } else {
        entry = {
          receiver: transaction.receiver,
          txHash: transaction.txHash,
          value: transaction.value,
          fee: transaction.fee,
        };
        wallet.available = wallet.available.minus(new BigNumber(transaction.value));
      }
    } else if (transaction.sender !== null && transaction.scResults === null) {
      entry = {
        sender: transaction.sender,
        txHash: transaction.txHash,
        value: transaction.value,
        fee: transaction.fee,
      };
      wallet.available = wallet.available.plus(new BigNumber(transaction.value));
    } else {
      console.log('warning: unknown transaction');
    }
    if (entry !== null) {
      entry.value = await denominate({
        input: entry.value,
        denomination: 18,
        decimals: 6,
        addCommas: false,
      });
      entry.fee = await denominate({
        input: entry.fee,
        denomination: 18,
        decimals: 6,
        addCommas: false,
      });
      wallet.history[transaction.timestamp] = entry;
    }
  }

  wallet.staked = denominate({
    input: wallet.staked.toFixed(),
    denomination: 18,
    decimals: 6,
    addCommas: false,
  });

  wallet.claimable = denominate({
    input: wallet.claimable.toFixed(),
    denomination: 18,
    decimals: 6,
    addCommas: false,
  });

  wallet.available = denominate({
    input: wallet.available.toFixed(),
    denomination: 18,
    decimals: 6,
    addCommas: false,
  });

  wallet.unDelegated = denominate({
    input: wallet.unDelegated.toFixed(),
    denomination: 18,
    decimals: 6,
    addCommas: false,
  });

  wallet.fees = denominate({
    input: wallet.fees.toFixed(),
    denomination: 18,
    decimals: 6,
    addCommas: false,
  });
  return wallet;
};

module.exports = getAddressHistory;
