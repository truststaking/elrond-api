const { getNodes, getTokens } = require('./helpers');

const { network } = require(`./configs/${process.env.CONFIG}`);

exports.handler = async () => {
  if (network !== 'mainnet') {
    await getTokens({ skipCache: true });
  }

  await getNodes({ skipCache: true });

  return true;
};
