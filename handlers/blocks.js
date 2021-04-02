const {
  elasticSearch: { getList, getItem, getCount, getPublicKeys },
  response,
} = require('./helpers');

const transformItem = async (item, fields) => {
  // eslint-disable-next-line no-unused-vars
  let { shardId: shard, epoch, proposer, validators } = item;

  const publicKeys = await getPublicKeys({ shard, epoch });

  item.proposer = publicKeys[proposer];
  item.validators = validators.map((index) => publicKeys[index]);
  item.shard = item.shardId;
  delete item.shardId;
  delete item.searchOrder;

  if (fields) {
    Object.keys(item).forEach((key) => {
      if (!fields.includes(key) && key !== 'hash') {
        delete item[key];
      }
    });
  }

  return item;
};

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'blocks';
    const key = 'hash';
    const { hash } = pathParameters || {};
    let query = queryStringParameters || {};
    // Prepare query fields
    let { fields } = query || {};
    if (fields) {
      fields = fields.split(',');

      // Mandatory fields
      query.fields = ['hash', 'proposer', 'shardId', 'epoch', 'validators'].concat(fields);
    }
    const keys = ['shard', 'from', 'size', 'fields'];

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
        data = await transformItem(item, fields);
        break;
      }
      default: {
        const sort = {
          timestamp: 'desc',
        };

        const items = await getList({ collection, key, query, sort });

        data = [];
        for (const item of items) {
          data.push(await transformItem(item, fields));
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
