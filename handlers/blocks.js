const {
  setForwardedHeaders,
  elasticSearch: { getList, getItem, getCount, getBlses, getBlsIndex },
  response,
} = require('./helpers');

const {
  cache: { live, final },
} = require(`./configs/${process.env.CONFIG}`);

const transformItem = async (item) => {
  // eslint-disable-next-line no-unused-vars
  let { shardId: shard, epoch, proposer, validators, searchOrder, ...rest } = item;

  const blses = await getBlses({ shard, epoch });

  proposer = blses[proposer];
  validators = validators.map((index) => blses[index]);

  return { shard, epoch, proposer, validators, ...rest };
};

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  try {
    const collection = 'blocks';
    const key = 'hash';
    const { hash } = pathParameters || {};
    let query = queryStringParameters || {};

    const keys = ['shard', 'from', 'size', 'proposer', 'validators', 'condition'];

    if (['proposer', 'shard', 'epoch'].every((key) => Object.keys(query).includes(key))) {
      const { proposer: bls, shard, epoch } = query;
      const index = await getBlsIndex({ bls, shard, epoch });

      if (index) query.proposer = index;
      else query.proposer = -1;
    }

    if (['validator', 'shard', 'epoch'].every((key) => Object.keys(query).includes(key))) {
      const { validator: bls, shard, epoch } = query;
      const index = await getBlsIndex({ bls, shard, epoch });

      if (index) query.validators = index;
      else query.validators = -1;
    }

    Object.keys(query).forEach((key) => {
      if (!keys.includes(key)) {
        delete query[key];
      }
    });

    // In elastic search exists only shardId
    if (query.shard) {
      query.shardId = query.shard;
      delete query.shard;
    }

    let data;
    let status;
    let cache;

    switch (true) {
      case hash !== undefined && hash === 'count': {
        data = await getCount({ collection, query });
        cache = live;
        break;
      }
      case hash !== undefined: {
        const item = await getItem({ collection, key, hash });
        data = await transformItem(item);
        cache = final;
        break;
      }
      default: {
        const sort = {
          timestamp: 'desc',
        };

        const items = await getList({ collection, key, query, sort });

        data = [];
        for (const item of items) {
          data.push(await transformItem(item));
        }

        cache = live;
        break;
      }
    }

    return response({ status, data, cache });
  } catch (error) {
    console.error('blocks error', error);
    return response({ status: 503 });
  }
};
