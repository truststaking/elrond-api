const vmQuery = require('./vmQuery');
const getChunks = require('./getChunks');
const { batchGetCache, batchPutCache, getCache, putCache } = require('./cache');
const getTokenProperties = require('./getTokenProperties');
const { esdtContract } = require(`../configs/${process.env.CONFIG}`);

const getTokens = async (args) => {
  let skipCache = false;

  if (args && args.skipCache) {
    skipCache = args.skipCache;
  }

  const key = 'tokens';
  const cached = await getCache({ key });

  if (cached && !skipCache) {
    return cached;
  }

  const [allESDTTokensEncoded] = await vmQuery({
    contract: esdtContract,
    func: 'getAllESDTTokens',
  });

  const tokensIdentifiers = Buffer.from(allESDTTokensEncoded, 'base64').toString().split('@');

  let chunks = getChunks(tokensIdentifiers, 100);

  const cachedChunks = await Promise.all(
    chunks.map((keys) => {
      return batchGetCache({ keys });
    })
  );

  let tokens = [];
  const missing = [];

  cachedChunks
    .reduce((all, chunk) => {
      return [...all, ...chunk];
    })
    .forEach((value, index) => {
      if (value) {
        tokens.push(value);
      } else {
        missing.push(tokensIdentifiers[index]);
      }
    });

  chunks = getChunks(missing);

  for (const keys of chunks) {
    const values = await Promise.all(keys.map((identifier) => getTokenProperties(identifier)));

    await batchPutCache({ keys, values, ttl: 180 });

    tokens = [...tokens, ...values];
  }

  await putCache({ key, value: tokens, ttl: 60 });

  return tokens;
};

module.exports = getTokens;
