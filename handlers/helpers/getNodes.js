const confirmKeybase = require('./confirmKeybase');
const batchProcess = require('./batchProcess');
const getHeartbeat = require('./getHeartbeat');
const getOwners = require('./getOwners');
const getProviders = require('./getProviders');
const getQueue = require('./getQueue');
const getStakes = require('./getStakes');
const { getCache, putCache } = require('./cache');

const { network } = require(`../configs/${process.env.CONFIG}`);

const getNodes = async (args) => {
  const { skipCache } = args || {};

  const key = 'nodes';

  if (!skipCache) {
    const cached = await getCache({ key });

    if (cached) {
      return cached;
    }
  }

  const nodes = await getHeartbeat({ skipCache });
  const queue = await getQueue({ skipCache });

  queue.forEach(({ bls }) => {
    const node = nodes.find((node) => node.bls === bls);

    if (node) {
      node.type = 'validator';
      node.status = 'queued';
    } else {
      nodes.push({ bls, type: 'validator', status: 'queued' });
    }
  });

  const payload = nodes
    .filter(({ identity }) => !!identity)
    .map(({ identity, bls }) => {
      return { identity, network, key: bls };
    });

  nodes.forEach((node) => delete node.identity);

  const confirmations = await batchProcess({
    payload,
    handler: confirmKeybase,
    ttl: 604800, // 7d
  });

  payload.forEach(({ identity, key }, index) => {
    if (confirmations[index]) {
      const node = nodes.find(({ bls }) => bls === key);
      node.identity = identity;
    }
  });

  const blses = nodes.filter(({ type }) => type === 'validator').map(({ bls }) => bls);
  const owners = await getOwners({ blses, skipCache });

  blses.forEach((bls, index) => {
    const node = nodes.find((node) => node.bls === bls);
    node.owner = owners[index];
  });

  const providers = await getProviders({ skipCache });

  nodes.forEach((node) => {
    if (node.type === 'validator') {
      const provider = providers.find(({ provider }) => provider === node.owner);

      if (provider) {
        node.provider = provider.provider;
        node.owner = provider.owner;

        if (provider.identity) {
          node.identity = provider.identity;
        }
      }
    }
  });

  let addresses = nodes
    .filter(({ type }) => type === 'validator')
    .map(({ owner, provider }) => (provider ? provider : owner));

  addresses = [...new Set(addresses)];

  const stakes = await getStakes({ addresses, skipCache });

  nodes.forEach((node) => {
    if (node.type === 'validator') {
      const stake = stakes.find(({ bls }) => bls === node.bls);

      if (stake) {
        node.stake = stake.stake;
        node.topUp = stake.topUp;
        node.locked = stake.locked;
      }
    }
  });

  await putCache({ key, value: nodes, ttl: 3600 }); // 1h

  return nodes;
};

module.exports = getNodes;
