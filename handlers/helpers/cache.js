const { promisify } = require('util');
const redis = require('redis');

const { redisUrl, cacheTtl } = require('../configs/config');

const client = redis.createClient(redisUrl);

client.on('error', (error) => {
  console.error('redis error', error);
});

const asyncSet = promisify(client.set).bind(client);
const asyncGet = promisify(client.get).bind(client);
const asyncMGet = promisify(client.mget).bind(client);

const asyncMulti = (commands) => {
  const multi = client.multi(commands);
  return promisify(multi.exec).call(multi);
};

const putCache = async ({ key, value, ttl = cacheTtl }) => {
  await asyncSet(key, JSON.stringify(value), 'EX', ttl);
};

const getCache = async ({ key }) => {
  const response = await asyncGet(key);
  return JSON.parse(response);
};

// TODO:
const batchPutCache = async ({ keys, values, ttl = cacheTtl }) => {
  const sets = keys.map((key, index) => {
    return ['set', key, JSON.stringify(values[index]), 'ex', ttl];
  });

  await asyncMulti(sets);
};

const batchGetCache = async ({ keys }) => {
  let response = await asyncMGet(keys);

  response = response.map((value) => (value ? JSON.parse(value) : null));

  return response;
};

module.exports = {
  putCache,
  getCache,
  batchPutCache,
  batchGetCache,
};
