const getAddressTransactions = require('./getAddressTransactions')
const BigNumber = require('bignumber.js');
const denominate = require('./denominate');
const e = require('express');

const getAddressHistory = async (address) => {

  data = await getAddressTransactions({receiver: address, sender: address});

  // return data;
  wallet = {
    history: {},
    active: new BigNumber("0"),
    claimable: new BigNumber("0"),
    available: new BigNumber("0"),
    unDelegated: new BigNumber("0"),
  }
  for (const transaction of data['transactions'])
  {

    let entry = null;


    if (transaction.receiver !== null)
    {
      if (transaction.scResults !== null)
      {
        let command = null;
        if (transaction.data !== null)
        {
          command = transaction.data.split('@')[0]
        }
        let value;
        entry = {
          data: command,
          agency: transaction.receiver,
          txHash: transaction.txHash,
          value: transaction.value,
          fee: transaction.fee
        }
        switch(command)
        {
          case 'delegate':
            wallet.active = wallet.active.plus(transaction.value);
            wallet.available = wallet.available.minus(transaction.value);
            break;
          case 'reDelegateRewards':
            if (transaction.scResults[0].data === undefined)
            {
              value = transaction.scResults[0].value;
            }
            else if (transaction.scResults[1].data === undefined)
            {
              value = transaction.scResults[1].value;
            }
            else
            {
              console.log("error: reDelegateRewards no valid value");
              break;
            }
            entry.value = value;
            wallet.active = wallet.active.plus(value);
            break;
          case 'claimRewards':
            if (transaction.scResults[0].data === undefined)
            {
              value = transaction.scResults[0].value;
            }
            else if (transaction.scResults[1].data === undefined)
            {
              value = transaction.scResults[1].value;
            }
            else
            {
              console.log("error: claimRewards no valid value");
              break;
            }
            entry.value = value;
            wallet.available = wallet.available.plus(value);
            break;
          case 'unDelegate':
            wallet.unDelegated = wallet.unDelegated.plus(transaction.value);
            wallet.active = wallet.active.minus(transaction.value)
            break;
          case 'withdraw':
            wallet.available = wallet.available.plus(transaction.value);
            wallet.unDelegated = wallet.unDelegated.minus(transaction.value);
            break;
          default:
            console.log("warning: unknown transaction");
            break;
        }
      }
      else
      {
        entry = {
          receiver: transaction.receiver,
          txHash: transaction.txHash,
          value: transaction.value,
          fee: transaction.fee
        }
        wallet.available = wallet.available.minus(transaction.value)
      }
    }
    else if (transaction.sender !== null && transaction.scResults === null)
    {
      entry = {
        sender: transaction.sender,
        txHash: transaction.txHash,
        value: transaction.value,
        fee: transaction.fee
      }
      wallet.available = wallet.available.plus(transaction.value)
    }
    else
    {
      console.log("warning: unknown transaction");
    }

    if (transaction.receiver !== null)
    {
      wallet.available = wallet.available.minus(transaction.fee)
    }
    if (entry !== null)
    {
      entry.value = await denominate({input:entry.value, denomination: 18, decimals: 6, addCommas: false});
      entry.fee = await denominate({input:entry.fee, denomination: 18, decimals: 6, addCommas: false});
      wallet.history[transaction.timestamp] = entry;   
    }

  }

  wallet.active = await denominate({input:wallet.active, denomination: 18, decimals: 6, addCommas: false});
  wallet.claimable = await denominate({input:wallet.claimable, denomination: 18, decimals: 6, addCommas: false});
  wallet.available = await denominate({input:wallet.available, denomination: 18, decimals: 6, addCommas: false});
  wallet.unDelegated = await denominate({input:wallet.unDelegated, denomination: 18, decimals: 6, addCommas: false});
  return wallet;

};

module.exports = getAddressHistory;