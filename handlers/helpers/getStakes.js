const bech32 = require('./bech32');
const vmQuery = require('./vmQuery');
const batchProcess = require('./batchProcess');
const { getCache, putCache } = require('./cache');

const { auctionContract } = require(`../configs/config`);

const getStakedTopup = async (address) => {
  const response = await vmQuery({
    contract: auctionContract,
    caller: auctionContract,
    func: 'getTotalStakedTopUpStakedBlsKeys',
    args: [bech32.decode(address)],
  });

  if (!response) {
    return {
      topUp: '0',
      stake: '0',
      address,
    };
  }

  const [topUpBase64, stakedBase64, numNodesBase64, ...blsesBase64] = response || [];

  const numNodesHex = Buffer.from(numNodesBase64, 'base64').toString('hex');
  const numNodes = BigInt(numNodesHex ? '0x' + numNodesHex : numNodesHex);

  const topUpHex = Buffer.from(topUpBase64, 'base64').toString('hex');
  const totalTopUp = BigInt(topUpHex ? '0x' + topUpHex : topUpHex);

  const stakedHex = Buffer.from(stakedBase64, 'base64').toString('hex');
  const totalStaked = BigInt(stakedHex ? '0x' + stakedHex : stakedHex) - totalTopUp;

  const totalLocked = totalStaked + totalTopUp;

  const blses = blsesBase64.map((nodeBase64) => Buffer.from(nodeBase64, 'base64').toString('hex'));

  if (totalStaked.toString() === '0' && numNodes.toString() === '0') {
    return {
      topUp: '0',
      stake: '0',
      numNodes: parseInt(numNodes.toString()),
      address,
      blses,
    };
  } else {
    const topUp = String(totalTopUp / numNodes);
    const stake = String(totalStaked / numNodes);
    const locked = String(totalLocked / numNodes);

    return {
      topUp,
      stake,
      locked,
      numNodes: parseInt(numNodes.toString()),
      address,
      blses,
    };
  }
};

const getStakes = async ({ addresses, skipCache }) => {
  const key = 'stakes';

  if (!skipCache) {
    const cached = await getCache({ key });

    if (cached) {
      return cached;
    }
  }

  const owners = await batchProcess({ payload: addresses, handler: getStakedTopup, ttl: 900 }); // 15m

  const value = [];

  owners.forEach(({ stake, topUp, locked, blses }) => {
    blses.forEach((bls) => {
      value.push({ bls, stake, topUp, locked });
    });
  });

  await putCache({ key, value, ttl: 3600 }); // 1h

  return value;
};

module.exports = getStakes;
