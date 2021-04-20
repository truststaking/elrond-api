const { promisify } = require('util');
const redis = require('redis');
const objectHash = require('node-object-hash');
const { hash } = objectHash({ sort: true, coerce: true });

const getChunks = require('./getChunks');

const { redisUrl, cacheTtl, network } = require(`../configs/${process.env.CONFIG}`);

const client = redis.createClient(redisUrl);

client.on('error', (error) => {
  console.error('redis error', error);
});

const asyncSet = promisify(client.set).bind(client);
const asyncGet = promisify(client.get).bind(client);
const asyncMSet = promisify(client.mset).bind(client);
const asyncMGet = promisify(client.mget).bind(client);
const asyncMulti = (commands) => {
  const multi = client.multi(commands);
  return promisify(multi.exec).call(multi);
};

const putCache = async ({ key, value, ttl = cacheTtl }) => {
  await asyncSet(`${network}:${key}`, JSON.stringify(value), 'EX', ttl);
};

const getCache = async ({ key }) => {
  const response = await asyncGet(`${network}:${key}`);

  return JSON.parse(response);
};

const batchPutCache = async ({ keys, values, ttls, strict = false }) => {
  if (!ttls) {
    ttls = new Array(keys.length).fill(cacheTtl);
  }

  const chunks = getChunks(
    keys.map((key, index) => {
      const element = {};
      element[key] = index;
      return element;
    }, 25)
  );

  const sets = [];

  for (const chunk of chunks) {
    const chunkKeys = chunk.map((element) => Object.keys(element)[0]);
    const chunkValues = chunk.map((element) => values[Object.values(element)[0]]);

    sets.push(
      ...chunkKeys.map((key, index) => {
        return ['set', key, JSON.stringify(chunkValues[index]), 'ex', ttls[index]];
      })
    );
  }

  await asyncMulti(sets);
};

const batchGetCache = async ({ keys }) => {
  const chunks = getChunks(keys, 100);

  const result = [];

  for (const chunkKeys of chunks) {
    let chunkValues = await asyncMGet(chunkKeys);

    chunkValues = chunkValues.map((value) => (value ? JSON.parse(value) : null));

    result.push(...chunkValues);
  }

  return result;
};

const hashKey = ({ key, data }) => {
  return `${key}:${network}:${hash(data)}`;
};

module.exports = {
  putCache,
  getCache,
  batchPutCache,
  batchGetCache,
  hashKey,
};
