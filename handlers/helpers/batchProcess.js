const asyncPool = require('tiny-async-pool');

const { batchGetCache, batchPutCache, hashKey } = require('./cache');

const getChunks = require('./getChunks');

const {
  processTtl,
  poolLimit,
  network,
  processLimit,
} = require(`../configs/${process.env.CONFIG}`);

const batchProcess = async ({ payload, handler, ttl = processTtl, skipCache = false }) => {
  if (!handler.name) {
    throw new Error('anonymous function handlers not supported');
  }

  const keys = payload.map((element) => hashKey({ key: handler.name, network, data: element }));

  let cached;
  if (skipCache) {
    cached = new Array(keys.length).fill(null);
  } else {
    cached = await batchGetCache({ keys });
  }

  const missing = cached
    .map((element, index) => (element === null ? index : false))
    .filter((element) => element !== false);

  let output = [];

  const chunks = getChunks(missing, processLimit);

  let counter = 0;

  for (const chunk of chunks) {
    let values;

    counter++;
    console.log('chunk ', counter, ' of ', chunks.length);

    if (chunk.length) {
      values = await asyncPool(
        poolLimit,
        chunk.map((value) => payload[value]),
        handler
      );

      const params = {
        keys: keys.filter((key, index) => chunk.includes(index)),
        values,
        ttls: values.map((value) => (value ? ttl : Math.min(ttl, processTtl))),
      };

      await batchPutCache(params);
    }

    output = output.concat(values);
  }

  return keys.map((key, index) =>
    missing.includes(index) ? output[missing.indexOf(index)] : cached[index]
  );
};

module.exports = batchProcess;
