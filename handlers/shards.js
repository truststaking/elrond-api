const {
  getNodes,
  cache: { getCache, putCache },
  response,
} = require('./helpers');

const {
  cache: { moderate },
} = require(`./configs/${process.env.CONFIG}`);

exports.handler = async () => {
  try {
    const key = 'shards';

    let data = await getCache({ key });

    if (!data) {
      const nodes = await getNodes();

      const validators = nodes.filter(
        ({ type, shard, status }) =>
          type === 'validator' &&
          shard !== undefined &&
          ['eligible', 'waiting', 'leaving'].includes(status)
      );

      const shards = [...new Set(validators.map(({ shard }) => shard))];

      data = shards.map((shard) => {
        const shardValidators = validators.filter((node) => node.shard === shard);
        const activeShardValidators = shardValidators.filter(({ online }) => online);

        return {
          shard,
          validators: shardValidators.length,
          activeValidators: activeShardValidators.length,
        };
      });

      await putCache({ key, value: data, ttl: 60 }); // 1m
    }

    return response({ data, cache: moderate });
  } catch (error) {
    console.error('shards error', error);
    return response({ status: 503 });
  }
};
