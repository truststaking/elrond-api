const { getList, getCount } = require('./elasticSearch');
const { decodeBigNumber } = require('@elrondnetwork/erdjs');
const denominate = require('./denominate')

const getTransaction = async (query) =>
{
    const collection = 'transactions';
    const key = 'txHash';
    const sort = {
        timestamp: 'desc',
        nonce: 'desc',
    };
    let cquery = JSON.parse(JSON.stringify(query));
    const count = await getCount({ collection, query});
    let transactions = [];
    let items;
    let i = 0;
    let size = count;
    while (i < count)
    {
        query = JSON.parse(JSON.stringify(cquery));
        items = await getList({ collection, key, query, sort });
        for (const item of items) {
            let scResults = null;
            if (item.scResults != null)
            {
                scResults = []
                for (const scResult of item.scResults)
                {
                    let data = scResult.data != null ? Buffer.from(scResult.data, 'base64').toString() : scResult.data;
                    if (data != null)
                    {
                        data = "@" + Buffer.from(data.substr(1), 'hex').toString();
                    }
                    scResults.push({
                        data: data, 
                        value: scResult.value
                    })
                }
            }
            let sender = null, receiver = null;
            if ("receiver" in query)
            {
                sender = item.sender
            }
            else
            {
                receiver = item.receiver
            }
            if (item.txHash == '2733e72a9ca035df1c0c41197cfe574ad25ae3a5ce68abc6fa95ac6ace4835a5')
            {
                let a = 10;
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
                scResults: scResults
            }
            if (data != null)
            {
                let values = data.split('@');
                if (values[0] == 'unDelegate')
                {   
                  transaction.data = values[0];
                  transaction.value = await denominate({input:decodeBigNumber(Buffer.from(values[1], "hex")).toFixed(), denomination: 1, decimals: 6, addCommas: false});
                }
            }
            transactions.push(transaction);
        }
        i += items.length;
        cquery.before = transactions[transactions.length - 1].timestamp
    }
    let data = {
        count: size,
        transactions: transactions
    }
    return data;

}

const getAddressTransactions = async (query) => {

  let now = Math.floor(Date.now() / 1000);
  if (query.before === undefined)
  {
    query.before = now;
  }

  let transactions = [];
  let count = 0;
  if (query.receiver !== undefined)
  {
    const queryReceiver = {
      receiver: query.receiver,
      before: query.before,
      after: query.after,
      from: '0',
      size: '10000',
      status: 'success',
    }
    let dataReceiver = await getTransaction(queryReceiver);
    count += dataReceiver['count'];
    transactions = [...transactions, ...dataReceiver['transactions']]
  }

  if (query.receiver !== undefined)
  {
    const querySender = {
      sender: query.sender,
      before: query.before,
      after: query.after,
      from: '0',
      size: '10000',
      status: 'success',
    }

    let dataSender = await getTransaction(querySender)
    count += dataSender['count']
    transactions = [...transactions, ...dataSender['transactions']]
  }
  

  if (query.ord === undefined || (query.ord !== undefined && query.ord === 'asc'))
  {
    transactions.sort(function(a, b){return a.timestamp - b.timestamp;});
  }
  else if (query.ord !== undefined && query.ord === 'desc')
  {
    transactions.sort(function(a, b){return b.timestamp - a.timestamp;});
  }
  else if (query.ord !== undefined)
  {
    count = -1;
  }


  let data = {
    count: count,
    transactions: transactions
  }
  return data;

};

module.exports = getAddressTransactions;