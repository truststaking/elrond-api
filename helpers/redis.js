const { promisify } = require('util');
const redis = require('redis');

const { redisUrl } = require('../config');

const client = redis.createClient(redisUrl);

client.on('error', (error) => {
  console.error(error);
});

const asyncSet = promisify(client.set).bind(client);
const asyncGet = promisify(client.get).bind(client);

const set = async (key, value, ttl = 6) => {
  await asyncSet(key, JSON.stringify(value), 'EX', ttl);
};

const get = async (key) => {
  const response = await asyncGet(key);
  return JSON.parse(response);
};

module.exports = {
  set,
  get,
};
