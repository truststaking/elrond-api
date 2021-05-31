const axios = require('axios');

const { getCache, putCache } = require('./cache');

const getTokenProperties = require('./getTokenProperties');
const batchProcess = require('./batchProcess');
const { gatewayUrl, axiosConfig } = require(`../configs/${process.env.CONFIG}`);

const getTokens = async (args) => {
  console.log('getTokens start');

  let { skipCache } = args || {};
  const key = 'getTokens';

  if (!skipCache) {
    const cached = await getCache({ key });

    if (cached) {
      return cached;
    }
  }

  let {
    data: {
      data: { tokens: tokensIdentifiers },
    },
  } = await axios.get(`${gatewayUrl()}/network/esdts`, axiosConfig);

  let tokens = await batchProcess({
    payload: tokensIdentifiers,
    handler: getTokenProperties,
    ttl: 3600, // 1h
  });

  const object = {};

  tokens.forEach((token) => {
    object[token.token] = token;
  });

  tokens = {
    object,
    array: tokens,
  };

  await putCache({ key, value: tokens, ttl: 3600 }); // 1h

  console.log('getTokens end');

  return tokens;
};

module.exports = getTokens;
