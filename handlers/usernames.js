const {
  elasticSearch: { getList, getItem, getCount },
  response,
} = require('../helpers');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'usernames';
    const key = 'username';
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
          const data = await getItem({ collection, key, hash });
        } catch (error) {
          status = 404;
        }

        break;
      }
      default: {
        const sort = {
          timestamp: 'desc',
          nonce: 'desc',
        };

        const data = await getList({ collection, key, query, sort });

        break;
      }
    }

    return response({ status, data });
  } catch (error) {
    console.error('usernames error', error);
    return response({ status: 503 });
  }
};
