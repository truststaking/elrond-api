const {
  axios,
  setForwardedHeaders,
  elasticSearch: { getList, getItem, getCount },
  response,
} = require('./helpers');

const {
  gatewayUrl,
  cache: { skip, live },
} = require(`./configs/${process.env.CONFIG}`);

const transformItem = async (item) => {
  // eslint-disable-next-line no-unused-vars
  const { searchOrder, ...rest } = item;
  return { ...rest };
};

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });
  try {
    const collection = 'transactions';
    const key = 'txHash';
    const { hash } = pathParameters || {};
    let query = queryStringParameters || {};

    const keys = [
      'sender',
      'receiver',
      'senderShard',
      'receiverShard',
      'from',
      'size',
      'before',
      'after',
      'condition',
      'miniBlockHash',
    ];

    Object.keys(query).forEach((key) => {
      if (!keys.includes(key)) {
        delete query[key];
      }
    });

    let data;
    let status;
    let cache;

    switch (true) {
      case hash !== undefined && hash === 'count': {
        data = await getCount({ collection, query });
        cache = live;
        break;
      }
      case hash !== undefined: {
        try {
          const item = await getItem({ collection, key, hash });
          data = await transformItem(item);
          cache = live;
        } catch (error) {
          try {
            const {
              data: {
                data: { transaction },
              },
            } = await axios({
              method: 'get',
              url: `${gatewayUrl()}/transaction/${hash}`,
            });

            const {
              round,
              gasLimit,
              gasPrice,
              gasUsed,
              miniblockHash: miniBlockHash,
              sourceShard: senderShard,
              destinationShard: receiverShard,
              nonce,
              receiver,
              sender,
              signature,
              status,
              value,
            } = transaction;

            // // TODO: pending alignment
            // const receiverShard = null;
            // const senderShard = null;

            data = {
              data: transaction.data,
              txHash: hash,
              gasLimit,
              gasPrice,
              gasUsed,
              miniBlockHash,
              nonce,
              receiver,
              receiverShard,
              round,
              sender,
              senderShard,
              signature,
              status,
              value,
            };
            cache = skip;
          } catch (error) {
            status = 404;
          }
        }
        break;
      }
      default: {
        const sort = {
          timestamp: 'desc',
          nonce: 'desc',
        };

        const items = await getList({ collection, key, query, sort });

        data = [];
        for (const item of items) {
          data.push(await transformItem(item));
        }

        cache = live;
        break;
      }
    }

    return response({ status, data, cache });
  } catch (error) {
    console.error('transactions error', error);
    return response({ status: 503 });
  }
};
