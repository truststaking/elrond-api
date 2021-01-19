const {
  elasticSearch: { getList, getItem, getCount },
  response,
} = require('../helpers');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'miniblocks';
    const key = 'miniBlockHash';
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
        data = await getItem({ collection, key, hash });
        break;
      }
      default: {
        const sort = {
          timestamp: 'desc',
        };

        data = await getList({ collection, key, query, sort });
        break;
      }
    }

    return response({ status, data });
  } catch (error) {
    console.error('miniblocks error', error);
    return response({ status: 503 });
  }
};
