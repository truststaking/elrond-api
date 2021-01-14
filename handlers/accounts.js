const axios = require('axios');

const {
  elasticSearch: { getList, getCount },
  response,
} = require('../helpers');

const { gatewayUrl } = require('../config');

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
          const {
            data: {
              data: {
                account: { address, nonce, balance, code, codeHash, rootHash },
              },
            },
          } = await axios({
            method: 'get',
            url: `${gatewayUrl()}/address/${hash}`,
          });

          data = { address, nonce, balance, code, codeHash, rootHash };
        } catch (error) {
          status = 404;
        }
        break;
      }
      default: {
        const sort = {
          balanceNum: 'desc',
        };

        data = await getList({ collection, key, query, sort });
        break;
      }
    }

    return response({ status, data });
  } catch (error) {
    console.error('accounts error', error);
    return response({ status: 503 });
  }
};
