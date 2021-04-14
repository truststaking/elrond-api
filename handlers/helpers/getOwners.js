const { batchGetCache, batchPutCache } = require('./cache');
const vmQuery = require('./vmQuery');
const bech32 = require('./bech32');

const { auctionContract, stakingContract } = require(`../configs/config`);

const getBlsOwner = async (bls) => {
  const [encodedOwnerBase64] = await vmQuery({
    contract: stakingContract,
    caller: auctionContract,
    func: 'getOwner',
    args: [bls],
  });

  return bech32.encode(Buffer.from(encodedOwnerBase64, 'base64').toString('hex'));
};

const getOwnerBlses = async (owner) => {
  const getBlsKeysStatusListEncoded = await vmQuery({
    contract: auctionContract,
    caller: auctionContract,
    func: 'getBlsKeysStatus',
    args: [bech32.decode(owner)],
  });

  if (!getBlsKeysStatusListEncoded) {
    return [];
  }

  return getBlsKeysStatusListEncoded.reduce((result, value, index, array) => {
    if (index % 2 === 0) {
      const [blsBase64, statusBase64] = array.slice(index, index + 2);

      const bls = Buffer.from(blsBase64, 'base64').toString('hex');
      const status = Buffer.from(statusBase64, 'base64').toString();

      result.push({ bls, status });
    }

    return result;
  }, []);
};

const getOwners = async ({ blses, skipCache }) => {
  const keys = blses.map((bls) => `owner:${bls}`);

  let cached;
  if (skipCache) {
    cached = new Array(keys.length).fill(null);
  } else {
    cached = await batchGetCache({ keys });
  }

  const missing = cached
    .map((element, index) => (element === null ? index : false))
    .filter((element) => element !== false);

  let owners = {};

  if (missing.length) {
    for (const index of missing) {
      const bls = blses[index];

      if (!owners[bls]) {
        const owner = await getBlsOwner(bls);
        const blses = await getOwnerBlses(owner);

        blses.forEach(({ bls }) => {
          owners[bls] = owner;
        });
      }
    }

    const params = {
      keys: Object.keys(owners).map((bls) => `owner:${bls}`),
      values: Object.values(owners),
      ttls: new Array(Object.keys(owners).length).fill(86400), // 24h
    };

    await batchPutCache(params);
  }

  return blses.map((bls, index) => (missing.includes(index) ? owners[bls] : cached[index]));
};

module.exports = getOwners;
