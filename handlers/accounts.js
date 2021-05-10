const {
  axios,
  setForwardedHeaders,
  elasticSearch: { getList, getCount },
  response,
} = require('./helpers');

const {
  elasticUrl,
  gatewayUrl,
  cache: { skip, live },
} = require(`./configs/${process.env.CONFIG}`);

const transformItem = async (item) => {
  // eslint-disable-next-line no-unused-vars
  const { balanceNum, ...rest } = item;
  return { ...rest };
};

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  try {
    const collection = 'accounts';
    const key = 'address';
    const { hash } = pathParameters || {};
    let query = queryStringParameters || {};

    const keys = ['from', 'size', 'condition'];

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
          const [
            {
              data: { count: txCount },
            },
            {
              data: {
                data: {
                  account: { address, nonce, balance, code, codeHash, rootHash },
                },
              },
            },
          ] = await Promise.all([
            axios.post(`${elasticUrl()}/transactions/_count`, {
              query: {
                bool: { should: [{ match: { sender: hash } }, { match: { receiver: hash } }] },
              },
            }),
            axios.get(`${gatewayUrl()}/address/${hash}`),
          ]);

          data = { address, nonce, balance, code, codeHash, rootHash, txCount };
          cache = skip;
        } catch (error) {
          status = 404;
        }
        break;
      }
      default: {
        const sort = {
          balanceNum: 'desc',
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
    console.error('accounts error', error);
    return response({ status: 503 });
  }
};
