const { getList, getCount } = require('./elasticSearch');
const denominate = require('./denominate');
const bech32 = require('./bech32');
const BigNumber = require('bignumber.js');

function hexToDec(hex) {
  return hex
    .toLowerCase()
    .split('')
    .reduce((result, ch) => result * 16 + '0123456789abcdefgh'.indexOf(ch), 0);
}

const getTransaction = async (query) => {
  const collection = 'transactions';
  const key = 'txHash';
  const sort = {
    timestamp: 'desc',
    nonce: 'desc',
  };
  let cquery = JSON.parse(JSON.stringify(query));
  const count = await getCount({ collection, query });
  let transactions = [];
  let items;
  let i = 0;
  let size = count;
  while (i < count) {
    query = JSON.parse(JSON.stringify(cquery));
    items = await getList({ collection, key, query, sort });
    for (const item of items) {
      let scResults = null;
      if (item.scResults != null) {
        scResults = [];
        for (const scResult of item.scResults) {
          let data =
            scResult.data != null ? Buffer.from(scResult.data, 'base64').toString() : scResult.data;

          if (data !== undefined) {
            var data_list = data.split('@');
            var data_list_hex = [];
            if (data_list.length > 1) {
              data_list.forEach((info, index) => {
                if (
                  index == 2 &&
                  Buffer.from(item.data, 'base64')
                    .toString()
                    .split('@')[0]
                    .localeCompare('createNewDelegationContract') == 0
                ) {
                  console.log(bech32.encode(info));
                  data_list_hex.push(bech32.encode(info));
                } else {
                  data_list_hex.push(Buffer.from(info, 'hex').toString());
                }
              });
            }
            data = data_list_hex.join('@');
          }

          scResults.push({
            data: data,
            value: scResult.value,
          });
        }
      }
      let sender = null,
        receiver = null;
      if ('receiver' in query) {
        sender = item.sender;
      } else {
        receiver = item.receiver;
      }
      let data = item.data != null ? Buffer.from(item.data, 'base64').toString() : item.data;
      let transaction = {
        txHash: item.txHash,
        data: data,
        timestamp: item.timestamp,
        fee: item.fee,
        value: item.value,
        sender: sender,
        receiver: receiver,
        scResults: scResults,
      };
      if (data != null) {
        let values = data.split('@');
        if (values[0] == 'unDelegate' || values[0] == 'unStake') {
          transaction.data = values[0];
          transaction.value = denominate({
            input: new BigNumber(hexToDec(values[1])).toFixed(),
            denomination: 0,
          });
        }
      }
      transactions.push(transaction);
    }
    i += items.length;
    cquery.before = transactions[transactions.length - 1].timestamp;
  }
  let data = {
    count: size,
    transactions: transactions,
  };
  return data;
};

const getAddressTransactions = async (query) => {
  let transactions = [];
  let count = 0;
  const queryReceiver = {
    receiver: query.address,
    before: query.before,
    from: '0',
    size: '10000',
    status: 'success',
  };
  if (query.sender !== undefined) {
    queryReceiver.sender = query.sender;
  }
  let dataReceiver = await getTransaction(queryReceiver);
  count += dataReceiver['count'];
  transactions = [...transactions, ...dataReceiver['transactions']];

  const querySender = {
    sender: query.address,
    before: query.before,
    from: '0',
    size: '10000',
    status: 'success',
  };
  if (query.receiver !== undefined) {
    querySender.receiver = query.receiver;
  }
  let dataSender = await getTransaction(querySender);
  count += dataSender['count'];
  transactions = [...transactions, ...dataSender['transactions']];

  if (query.ord === undefined || (query.ord !== undefined && query.ord === 'asc')) {
    transactions.sort(function (a, b) {
      return a.timestamp - b.timestamp;
    });
  } else if (query.ord !== undefined && query.ord === 'desc') {
    transactions.sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });
  } else if (query.ord !== undefined) {
    count = -1;
  }

  let data = {
    count: count,
    transactions: transactions,
  };
  return data;
};

module.exports = getAddressTransactions;
