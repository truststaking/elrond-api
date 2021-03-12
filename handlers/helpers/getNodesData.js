const bech32 = require('./bech32');
const vmQuery = require('./vmQuery');
const { getCache, putCache } = require('./cache');

const {
  auctionContract,
  stakingContract,
  delegationManagerContract,
} = require('../configs/config');

const getNodeOwner = async (publicKey) => {
  const [encodedOwnerHex] = await vmQuery({
    contract: stakingContract,
    caller: auctionContract,
    func: 'getOwner',
    args: [publicKey],
  });

  return bech32.encode(Buffer.from(encodedOwnerHex, 'base64').toString('hex'));
};

const getProviderOwner = async (address) => {
  const [ownerBase64] = await vmQuery({
    contract: address,
    func: 'getContractConfig',
  });

  return bech32.encode(Buffer.from(ownerBase64, 'base64').toString('hex'));
};

const getProviders = async () => {
  const providersBase64 = await vmQuery({
    contract: delegationManagerContract,
    func: 'getAllContractAddresses',
  });

  const providers = providersBase64.map((providerBase64) =>
    bech32.encode(Buffer.from(providerBase64, 'base64').toString('hex'))
  );

  const owners = await Promise.all(providers.map((provider) => getProviderOwner(provider)));

  return providers.map((provider, index) => {
    return {
      provider,
      owner: owners[index],
    };
  });
};

const getAccountStakeTopUp = async (address) => {
  const [topUpBase64, stakedBase64, numNodesBase64] = await vmQuery({
    contract: auctionContract,
    caller: auctionContract,
    func: 'getTotalStakedTopUpStakedBlsKeys',
    args: [bech32.decode(address)],
  });

  const numNodesHex = Buffer.from(numNodesBase64, 'base64').toString('hex');
  const numNodes = BigInt(numNodesHex ? '0x' + numNodesHex : numNodesHex);

  const topUpHex = Buffer.from(topUpBase64, 'base64').toString('hex');
  const totalTopUp = BigInt(topUpHex ? '0x' + topUpHex : topUpHex);

  const stakedHex = Buffer.from(stakedBase64, 'base64').toString('hex');
  const totalStaked = BigInt(stakedHex ? '0x' + stakedHex : stakedHex) - totalTopUp;

  if (
    totalTopUp.toString() === '0' &&
    totalStaked.toString() === '0' &&
    numNodes.toString() === '0'
  ) {
    return { topUp: '0', stake: '0' };
  } else {
    const topUp = String(totalTopUp / numNodes);
    const stake = String(totalStaked / numNodes);

    return { topUp, stake };
  }
};

const getAccountValidators = async (address) => {
  const getBlsKeysStatusListEncoded = await vmQuery({
    contract: auctionContract,
    caller: auctionContract,
    func: 'getBlsKeysStatus',
    args: [bech32.decode(address)],
  });

  const data = getBlsKeysStatusListEncoded.reduce((result, value, index, array) => {
    if (index % 2 === 0) {
      const [publicKeyBase64, stakingStatusBase64] = array.slice(index, index + 2);

      const publicKey = Buffer.from(publicKeyBase64, 'base64').toString('hex');
      const stakingStatus = Buffer.from(stakingStatusBase64, 'base64').toString();

      result.push({ publicKey, stakingStatus });
    }

    return result;
  }, []);

  return data;
};

const getNodesData = async (args) => {
  const key = 'nodesData';
  let data = await getCache({ key });

  const { publicKeys, skipCache } = args || {};

  if (data && !skipCache) {
    return data;
  } else {
    data = [];
  }

  const providers = await getProviders();

  for (const publicKey of publicKeys) {
    if (!data.find((item) => item.publicKey === publicKey)) {
      let owner = await getNodeOwner(publicKey);
      let provider = undefined;

      const accountValidators = await getAccountValidators(owner);
      const { topUp, stake } = await getAccountStakeTopUp(owner);

      const found = providers.find((item) => item.provider === owner);
      if (found) {
        owner = found.owner;
        provider = found.provider;
      }

      accountValidators.forEach(({ publicKey, stakingStatus }) => {
        if (stakingStatus === 'unStaked') {
          data.push({ publicKey, stakingStatus, owner, provider, stake: '0', topUp: '0' });
        } else {
          data.push({ publicKey, stakingStatus, owner, provider, stake, topUp });
        }
      });
    }
  }

  await putCache({ key, value: data, ttl: 500 });

  return data;
};

module.exports = getNodesData;
