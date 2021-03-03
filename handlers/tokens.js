const { axios } = require('./helpers');

const { getTokens, response } = require('./helpers');
const { gatewayUrl } = require('./configs/config');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  const { hash: address } = pathParameters;

  if (address) {
    try {
      let [
        {
          data: {
            data: { tokens: addressTokens },
          },
        },
        tokens,
      ] = await Promise.all([axios.get(`${gatewayUrl()}/address/${address}/esdt`), getTokens()]);

      tokens = tokens.filter(({ tokenIdentifier }) => addressTokens.includes(tokenIdentifier));

      const balancesResults = await Promise.all(
        tokens.map(({ tokenIdentifier }) =>
          axios.get(`${gatewayUrl()}/address/${address}/esdt/${tokenIdentifier}`)
        )
      );

      balancesResults
        .map(
          ({
            data: {
              data: {
                tokenData: { balance },
              },
            },
          }) => balance
        )
        .forEach((balance, index) => {
          tokens[index].balance = balance;
        });

      return response({ data: tokens });
    } catch (error) {
      console.error('address tokens error', error);
      return response({ data: [] });
    }
  } else {
    try {
      const { identifier } = pathParameters;
      const { from = 0, size = 25 } = queryStringParameters;

      let results;
      const tokens = await getTokens();

      switch (true) {
        case identifier && identifier !== 'count': {
          const token = tokens.find(({ tokenIdentifier }) => tokenIdentifier === identifier);
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

      return response(results);
    } catch (error) {
      console.error('tokens error', error);
      return response({ status: 503 });
    }
  }
};
