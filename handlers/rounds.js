const {
  elasticSearch: { getList, getCount, getPublicKeys },
  response,
} = require('./helpers');

const transformItem = async (item, fields) => {
  let { key, round, signersIndexes } = item;

  // TODO: use the indexed value when available
  const epoch = Math.floor(round / 14401);

  let [shard] = key.split('_');
  shard = parseInt(shard);

  const publicKeys = await getPublicKeys({ shard, epoch });
  const signers = signersIndexes.map((index) => publicKeys[index]);
  item.signers = signers;
  delete item.signersIndexes;
  delete item.key;

  if (fields) {
    Object.keys(item).forEach((key) => {
      if (!fields.includes(key)) {
        delete item[key];
      }
    });
  }
  return item;
};

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'rounds';
    const key = 'key';
    const { hash } = pathParameters || {};
    let query = queryStringParameters || {};
    // Prepare query fields
    let { fields } = query || {};
    if (fields) {
      fields = fields.split(',');
      query.fields = ['shardId', 'round', 'signersIndexes'].concat(fields);
    }
    const keys = ['shard', 'from', 'size', 'fields'];

    Object.keys(query).forEach((key) => {
      if (!keys.includes(key)) {
        delete query[key];
      }
    });

    let data;
    let status;

    switch (true) {
      case hash !== undefined && hash === 'count': {
        data = await getCount({ collection, query });
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
    console.error('rounds error', error);
    return response({ status: 503 });
  }
};
