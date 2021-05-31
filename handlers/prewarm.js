const { getNodes, getTokens } = require('./helpers');

exports.handler = async () => {
  await getNodes({ skipCache: true });
  await getTokens({ skipCache: true });

  return true;
};
