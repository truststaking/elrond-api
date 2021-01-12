const {
  elasticSearch: { getList, getItem, getCount },
  response,
} = require('../helpers');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'transactions';
    const key = 'txHash';
    const { hash } = pathParameters;
    const query = queryStringParameters;

    // available params

    //

    let data;

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
        data = await getList({ collection, key, query });
        break;
      }
    }

    return response({ data });
  } catch (error) {
    console.error('accounts error', error);
    return response({ status: 503 });
  }
};
