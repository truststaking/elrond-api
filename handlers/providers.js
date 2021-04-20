const { axios, getProviders, getNodes, setForwardedHeaders, response } = require('./helpers');

const {
  providersUrl,
  cache: { moderate },
} = require(`./configs/${process.env.CONFIG}`);

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  try {
    const { key } = pathParameters || {};
    const { identity } = queryStringParameters || {};

    let providers = await getProviders();
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

    const { data } = await axios.get(providersUrl);

    providers.forEach((provider) => {
      const found = data.find((element) => provider.provider === element.contract);

      if (found) {
        provider.apr = parseFloat(found.aprValue.toFixed(2));
      }
    });

    if (key) {
      const provider = providers.find(({ provider }) => provider === key);

      if (provider) {
        return response({ data: provider, cache: moderate });
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

    return response({ data: providers, cache: moderate });
  } catch (error) {
    console.error('providers error', error);
    return response({ status: 503 });
  }
};
