const { axios, setForwardedHeaders, getTokens, response } = require('./helpers');

const {
  gatewayUrl,
  cache: { moderate, live },
} = require(`./configs/${process.env.CONFIG}`);

let globalArray;
let globalObject;
let globalTimestamp;

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  const { hash: address, identifier } = pathParameters || {};
  const { from = 0, size = 25, search = false } = queryStringParameters || {};

  let array;
  let object;

  // attempt to not reload the nodes sooner than once every 30 seconds
  if (
    globalArray &&
    globalObject &&
    globalTimestamp &&
    globalTimestamp + 30 < Math.floor(Date.now() / 1000)
  ) {
    array = globalArray;
    object = globalObject;
  } else {
    const tokens = await getTokens();
    array = tokens.array;
    object = tokens.object;
    globalArray = array;
    globalObject = object;
    globalTimestamp = Math.floor(Date.now() / 1000);
  }

  if (address) {
    try {
      let results;

      let {
        data: {
          data: { esdts },
        },
      } = await axios.get(`${gatewayUrl()}/address/${address}/esdt`);

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

      switch (true) {
        case identifier && identifier !== 'count': {
          const token = filtered.find(({ token }) => token === identifier);
          results = token ? { data: token } : { status: 404 };
          break;
        }
        case identifier && identifier === 'count': {
          results = { data: filtered.length };
          break;
        }
        default: {
          const endIndex = parseInt(from) + parseInt(size);
          results = { data: filtered.slice(parseInt(from), endIndex) };
          break;
        }
      }

      return response({ ...results, cache: live });
    } catch (error) {
      console.error('address tokens', error);
      return response({ data: [], cache: live });
    }
  } else {
    try {
      let results;

      let fungible = array.filter(({ type }) => type === 'FungibleESDT');

      if (search) {
        fungible = fungible.filter(({ token, name }) => {
          const tokenMatches = token.toLowerCase().includes(search.toLowerCase());
          const nameMatches = name.toLowerCase().includes(search.toLowerCase());

          return tokenMatches || nameMatches;
        });
      }

      switch (true) {
        case identifier && identifier !== 'count': {
          results = object[identifier] ? { data: object[identifier] } : { status: 404 };
          break;
        }
        case identifier && identifier === 'count': {
          results = { data: fungible.length };
          break;
        }
        default: {
          const endIndex = parseInt(from) + parseInt(size);
          results = { data: fungible.slice(parseInt(from), endIndex) };
          break;
        }
      }

      return response({ ...results, cache: moderate });
    } catch (error) {
      console.error('tokens error', error);
      return response({ status: 503 });
    }
  }
};
