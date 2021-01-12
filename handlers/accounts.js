const {
  elasticSearch: { getList, getItem, getCount },
  response,
} = require('../helpers');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'accounts';
    const key = 'address';
    const { hash } = pathParameters;
    const params = queryStringParameters;

    let data;

    switch (true) {
      case hash !== undefined && hash === 'count': {
        data = await getCount({ collection, params });
        break;
      }
      case hash !== undefined: {
        data = await getItem({ collection, key });
        break;
      }
      default: {
        data = await getList({ collection, key, params });
        break;
      }
    }

    return response({ data });
  } catch (error) {
    console.error('accounts error', error);
    return response({ status: 503 });
  }
};
