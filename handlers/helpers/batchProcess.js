const asyncPool = require('tiny-async-pool');

const { batchGetCache, batchPutCache, hashKey } = require('./cache');

const { processTtl, poolLimit, network } = require(`../configs/${process.env.CONFIG}`);

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

  let values;

  if (missing.length) {
    values = await asyncPool(
      poolLimit,
      missing.map((index) => payload[index]),
      handler
    );

    const params = {
      keys: keys.filter((key, index) => missing.includes(index)),
      values,
      ttls: values.map((value) => (value ? ttl : Math.min(ttl, processTtl))),
    };

    await batchPutCache(params);
  }

  //   console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
  //   console.log('cached', JSON.stringify(cached));
  //   console.log('missing', JSON.stringify(missing));
  //   console.log('values', JSON.stringify(values));
  //   console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');

  return keys.map((key, index) =>
    missing.includes(index) ? values[missing.indexOf(index)] : cached[index]
  );
};

module.exports = batchProcess;
