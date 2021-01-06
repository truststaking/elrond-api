const axios = require('axios');

const { getTokenProperties, vmQuery, response } = require('../helpers');
const { esdtContract, gatewayUrl } = require('../config');

exports.handler = async ({ pathParameters }) => {
  let address;
  let identifier;

  if (pathParameters) {
    if (pathParameters.hash) {
      address = pathParameters.hash;
    } else if (pathParameters.identifier) {
      identifier = pathParameters.identifier;
    }
  }

  if (address) {
    try {
      const {
        data: {
          data: { tokens },
        },
      } = await axios.get(`${gatewayUrl()}/address/${address}/esdt`);

      const promises = [];

      tokens.forEach((tokenIdentifier) => {
        promises.push(axios.get(`${gatewayUrl()}/address/${address}/esdt/${tokenIdentifier}`));
        promises.push(getTokenProperties(tokenIdentifier));
      });

      const results = await Promise.all(promises);

      const data = results.reduce((result, value, index, array) => {
        if (index % 2 === 0) {
          const [
            {
              data: {
                data: { tokenData },
              },
            },
            { tokenName, numDecimals },
          ] = array.slice(index, index + 2);

          result.push({ ...tokenData, tokenName, numDecimals });
        }
        return result;
      }, []);

      return response({ data });
    } catch (error) {
      console.error('address tokens', error);
      return response({ data: [] });
    }
  } else {
    try {
      const [allESDTTokensEncoded] = await vmQuery({
        contract: esdtContract,
        func: 'getAllESDTTokens',
      });

      let tokensIdentifiers = Buffer.from(allESDTTokensEncoded, 'base64').toString().split('@');

      if (identifier) {
        if (tokensIdentifiers.includes(identifier)) {
          tokensIdentifiers = [identifier];
        } else {
          return response({ status: 404 });
        }
      }

      const tokensProperties = await Promise.all(
        tokensIdentifiers.map((tokenIdentifier) => getTokenProperties(tokenIdentifier))
      );

      return response({ data: identifier ? tokensProperties[0] : tokensProperties });
    } catch (error) {
      console.error('tokens', error);
      return response({ status: 503 });
    }
  }
};
