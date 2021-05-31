const axios = require('axios');

const { getTokens, response } = require('./helpers');

const { gatewayUrl, axiosConfig } = require(`./configs/${process.env.CONFIG}`);

const queryFilter = ({ array, type, search }) => {
  let tokens = array.filter(({ type: tokenType, token, name }) => {
    if (search) {
      const tokenMatches = token.toLowerCase().includes(search.toLowerCase());
      const nameMatches = name.toLowerCase().includes(search.toLowerCase());

      if (!tokenMatches && !nameMatches) return false;
    }

    if (type && tokenType !== type) return false;

    return true;
  });

  return tokens;
};

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  const { hash: address, identifier } = pathParameters || {};
  const { from = 0, size = 25, search = false, type } = queryStringParameters || {};

  const { array, object } = await getTokens();

  if (address) {
    try {
      let results;

      let {
        data: {
          data: { esdts },
        },
      } = await axios.get(`${gatewayUrl()}/address/${address}/esdt`, axiosConfig);

      const addressTokens = {};

      Object.keys(esdts).forEach((key) => {
        const parts = key.split('-');
        parts.length = 2;
        addressTokens[key] = parts.join('-');
      });

      let filtered = [];

      Object.keys(esdts).forEach((key) => {
        const { tokenIdentifier: identifier, ...rest } = esdts[key];

        filtered.push({ ...object[addressTokens[key]], identifier, ...rest });
      });

      const tokens = queryFilter({ array: filtered, type, search });

      switch (true) {
        case identifier && identifier !== 'count': {
          const token = tokens.find(({ token }) => token === identifier);
          results = token ? { data: token } : { status: 404 };
          break;
        }
        case identifier && identifier === 'count': {
          results = { data: tokens.length };
          break;
        }
        default: {
          const endIndex = parseInt(from) + parseInt(size);
          results = { data: tokens.slice(parseInt(from), endIndex) };
          break;
        }
      }

      return response({ ...results });
    } catch (error) {
      console.error('address tokens', error);
      return response({ data: [] });
    }
  } else {
    try {
      let results;

      const tokens = queryFilter({ array, type, search });

      switch (true) {
        case identifier && identifier !== 'count': {
          results = object[identifier] ? { data: object[identifier] } : { status: 404 };
          break;
        }
        case identifier && identifier === 'count': {
          results = { data: tokens.length };
          break;
        }
        default: {
          const endIndex = parseInt(from) + parseInt(size);
          results = { data: tokens.slice(parseInt(from), endIndex) };
          break;
        }
      }

      return response({ ...results });
    } catch (error) {
      console.error('tokens error', error);
      return response({ status: 503 });
    }
  }
};
