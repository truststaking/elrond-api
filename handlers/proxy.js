const { axios, response } = require('./helpers');

const {
  network,
  cache: { skip },
} = require(`./configs/${process.env.CONFIG}`);

const { gatewayUrl } = require(`./configs/${process.env.CONFIG}`);

exports.handler = async ({ httpMethod, body, path }) => {
  if (!['mainnet', 'internal'].includes(network)) {
    throw new Error('move to gateway hostname');
  }

  try {
    const { data } = await axios({
      method: httpMethod.toLowerCase(),
      url: gatewayUrl() + path,
      data: body,
    });

    return response({ data, cache: skip });
  } catch (error) {
    const {
      response: { status, data },
    } = error;

    return response({ status, data, cache: skip });
  }
};
