const axios = require('axios');

const {
  elasticSearch: { getList, getItem, getCount },
  response,
} = require('../helpers');

const { elasticUrl } = require('../config');

const publicKeysCache = {};
const getPublicKeys = async ({ shard, epoch }) => {
  const key = `${shard}_${epoch}`;

  if (publicKeysCache[key]) {
    return publicKeysCache[key];
  }

  const url = `${elasticUrl()}/validators/_doc/${key}`;

  const {
    data: {
      _source: { publicKeys },
    },
  } = await axios.get(url);

  publicKeysCache[key] = publicKeys;

  return publicKeys;
};

const transformItem = async (item) => {
  let { shardId: shard, epoch, proposer, validators, ...rest } = item;

  const publicKeys = await getPublicKeys({ shard, epoch });

  proposer = publicKeys[proposer];
  validators = validators.map((index) => publicKeys[index]);

  return { shard, epoch, proposer, validators, ...rest };
};

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'blocks';
    const key = 'hash';
    const { hash } = pathParameters;
    let query = queryStringParameters;

    const keys = ['shard', 'from', 'size'];

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
