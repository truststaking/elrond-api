const { axios, response } = require('./helpers');

const {
  gatewayUrl,
  elasticUrl,
  metaChainShard,
  cache: { live },
} = require(`./configs/${process.env.CONFIG}`);

exports.handler = async () => {
  try {
    const [
      {
        data: {
          data: {
            config: { erd_num_shards_without_meta: shards, erd_round_duration: refreshRate },
          },
        },
      },
      {
        data: {
          data: {
            status: {
              erd_epoch_number: epoch,
              erd_rounds_passed_in_current_epoch: roundsPassed,
              erd_rounds_per_epoch: roundsPerEpoch,
            },
          },
        },
      },
      {
        data: { count: blocks },
      },
      {
        data: { count: accounts },
      },
      {
        data: { count: transactions },
      },
    ] = await Promise.all([
      axios.get(`${gatewayUrl()}/network/config`),
      axios.get(`${gatewayUrl()}/network/status/${metaChainShard}`),
      axios.get(`${elasticUrl()}/blocks/_count`),
      axios.get(`${elasticUrl()}/accounts/_count`),
      axios.get(`${elasticUrl()}/transactions/_count`),
    ]);

    return response({
      data: {
        shards,
        blocks,
        accounts,
        transactions,
        refreshRate,
        epoch,
        roundsPassed,
        roundsPerEpoch,
      },
      cache: live,
    });
  } catch (error) {
    console.error('stats error', error);
    return response({ status: 503 });
  }
};
