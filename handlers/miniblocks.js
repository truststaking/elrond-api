const {
  elasticSearch: { getList, getItem, getCount },
  response,
  setForwardedHeaders,
} = require('./helpers');

const {
  cache: { live, final },
} = require(`./configs/${process.env.CONFIG}`);

const transformItem = async (item) => {
  return { ...item };
};

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  try {
    const collection = 'miniblocks';
    const key = 'miniBlockHash';
    const { hash } = pathParameters || {};
    let query = queryStringParameters || {};

    const keys = ['from', 'size', 'condition'];

    Object.keys(query).forEach((key) => {
      if (!keys.includes(key)) {
        delete query[key];
      }
    });

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
    console.error('miniblocks error', error);
    return response({ status: 503 });
  }
};
