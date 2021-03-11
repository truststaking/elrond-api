const { promisify } = require('util');
const redis = require('redis');

const { redisUrl, cacheTtl } = require('../configs/config');

const client = redis.createClient(redisUrl);

client.on('error', (error) => {
  console.error('redis error', error);
});

const asyncSet = promisify(client.set).bind(client);
const asyncGet = promisify(client.get).bind(client);
const asyncMSet = promisify(client.mset).bind(client);
const asyncMGet = promisify(client.mget).bind(client);

const putCache = async ({ key, value, ttl = cacheTtl }) => {
  await asyncSet(key, JSON.stringify(value), 'EX', ttl);
};

const getCache = async ({ key }) => {
  const response = await asyncGet(key);
  return JSON.parse(response);
};

// TODO:
const batchPutCache = async ({ keys, values, ttl = cacheTtl }) => {
  const data = [];

  keys.forEach((key, index) => {
    data.push(key);
    data.push(JSON.stringify(values[index]));
  });

  await asyncMSet(data);
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
