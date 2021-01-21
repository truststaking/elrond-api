const axios = require('axios');

const {
  elasticSearch: { getList, getCount },
  response,
} = require('../helpers');

const { elasticUrl, gatewayUrl } = require('../config');

const transformItem = async (item) => {
  const { searchOrder, ...rest } = item;
  return { ...rest };
};

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'accounts';
    const key = 'address';
    const { hash } = pathParameters;
    let query = queryStringParameters;

    const keys = ['from', 'size'];

    Object.keys(query).forEach((key) => {
      if (!keys.includes(key)) {
        delete query[key];
      }
    });

    let data;
    let status;

    switch (true) {
      case hash !== undefined && hash === 'count': {
        data = await getCount({ collection, query });
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
            axios({
              method: 'get',
              url: `${gatewayUrl()}/address/${hash}`,
            }),
          ]);

          data = { address, nonce, balance, code, codeHash, rootHash, txCount };
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
        break;
      }
    }

    return response({ status, data });
  } catch (error) {
    console.error('accounts error', error);
    return response({ status: 503 });
  }
};
