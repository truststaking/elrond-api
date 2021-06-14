const { response, getDistribution } = require('./helpers');

exports.handler = async () => {
  try {
    const data = await getDistribution();

    return response({ status: 200, data });
  } catch (error) {
    console.error('getDistribution', error);
    return response({ status: 503 });
  }
};
