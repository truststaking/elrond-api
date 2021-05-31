const { response, getRewardsHistory } = require('./helpers');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    let query = queryStringParameters || {};
    let { fields } = query || {};
    const keys = ['address', 'start', 'end'];

    Object.keys(query).forEach((key) => {
      if (!keys.includes(key)) {
        delete query[key];
      }
    });
    if (query.address === undefined) {
      return response({ data: ['No address given!'] });
    }

    query.end = query.end || Math.floor(Date.now() / 1000);
    let data;
    let status;
    data = await getRewardsHistory(query);

    return response({ status, data, fields });
  } catch (error) {
    console.error('transactions error', error);
    return response({ status: 503 });
  }
};
