const { response, getAVGAPY } = require('./helpers');

exports.handler = async () => {
  try {
    const data = await getAVGAPY();

    return response({ status: 200, data });
  } catch (error) {
    console.error('getAVGAPY', error);
    return response({ status: 503 });
  }
};
