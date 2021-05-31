const {
  elasticSearch: { getList, getItem, getCount, getBlses, getBlsIndex },
  response,
} = require('./helpers');

const transformItem = async (item) => {
  // eslint-disable-next-line no-unused-vars
  let { shardId: shard, epoch, proposer, validators, searchOrder, ...rest } = item;

  const blses = await getBlses({ shard, epoch });

  proposer = blses[proposer];
  validators = validators.map((index) => blses[index]);

  return { shard, epoch, proposer, validators, ...rest };
};

exports.handler = async ({ pathParameters, queryStringParameters }) => {
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

    switch (true) {
      case hash !== undefined && hash === 'count': {
        data = await getCount({ collection, query });
        break;
      }
      case hash !== undefined: {
        const item = await getItem({ collection, key, hash });
        data = await transformItem(item);
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
        break;
      }
    }

    return response({ status, data });
  } catch (error) {
    console.error('blocks error', error);
    return response({ status: 503 });
  }
};
