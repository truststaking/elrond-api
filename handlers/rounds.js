const {
  elasticSearch: { getList, getCount, getBlses, getBlsIndex },
  response,
  setForwardedHeaders,
} = require('./helpers');

const {
  cache: { live },
} = require(`./configs/${process.env.CONFIG}`);

const transformItem = async (item) => {
  let { key, round, timestamp, blockWasProposed, signersIndexes } = item;

  // TODO: use the indexed value when available
  const epoch = Math.floor(round / 14401);

  let [shard] = key.split('_');
  shard = parseInt(shard);

  const blses = await getBlses({ shard, epoch });
  // const signers = signersIndexes.map((index) => blses[index]);

  return { round, shard, blockWasProposed, timestamp }; //signers
};

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  try {
    const collection = 'rounds';
    const key = 'key';
    const { hash } = pathParameters || {};
    let query = queryStringParameters || {};

    const keys = ['shard', 'from', 'size', 'condition', 'signersIndexes'];

    if (['validator', 'shard', 'epoch'].every((key) => Object.keys(query).includes(key))) {
      const { validator: bls, shard, epoch } = query;
      const index = await getBlsIndex({ bls, shard, epoch });

      delete query.validator;

      if (index) {
        query.signersIndexes = index;
      } else {
        query.signersIndexes = -1;
      }
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
    console.error('rounds error', error);
    return response({ status: 503 });
  }
};
