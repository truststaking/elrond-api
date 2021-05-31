const axios = require('axios');

const { getProviders, getNodes, response } = require('./helpers');

const { providersUrl, axiosConfig } = require(`./configs/${process.env.CONFIG}`);

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const { key } = pathParameters || {};
    const { identity } = queryStringParameters || {};

    let providers = await getProviders();
    if (providers) {
      const nodes = await getNodes();

      providers.forEach((element) => {
        const filtered = nodes.filter(({ provider }) => element.provider === provider);

        const results = filtered.reduce(
          (accumulator, current) => {
            if (current && current.stake && current.topUp && current.locked) {
              accumulator.numNodes += 1;
              accumulator.stake += BigInt(current.stake);
              accumulator.topUp += BigInt(current.topUp);
              accumulator.locked += BigInt(current.locked);
            }

            return accumulator;
          },
          {
            numNodes: 0,
            stake: BigInt('0'),
            topUp: BigInt('0'),
            locked: BigInt('0'),
          }
        );

        element.numNodes = results.numNodes;
        element.stake = results.stake.toString();
        element.topUp = results.topUp.toString();
        element.locked = results.locked.toString();
        element.sort =
          element.locked && element.locked !== '0' ? parseInt(element.locked.slice(0, -18)) : 0;
      });

      const { data } = await axios.get(providersUrl, axiosConfig);

      providers.forEach((provider) => {
        const found = data.find((element) => provider.provider === element.contract);

        if (found) {
          provider.apr = parseFloat(found.aprValue ? found.aprValue.toFixed(2) : 0);
        }
      });

      if (key) {
        const provider = providers.find(({ provider }) => provider === key);

        if (provider) {
          return response({ data: provider });
        } else {
          return response({ status: 404 });
        }
      }

      if (identity) {
        providers = providers.filter((provider) => provider.identity === identity);
      }

      providers.sort((a, b) => {
        return b.sort - a.sort;
      });

      providers.forEach((provider) => {
        delete provider.sort;
        delete provider.owner;
      });
    }
    return response({ data: providers });
  } catch (error) {
    console.error('providers error', error);
    return response({ status: 503 });
  }
};
