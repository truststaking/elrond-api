const yup = require('yup');

const { bech32 } = require('../helpers');

const {
  elasticSearch: { getList, getItem, getCount },
  response,
} = require('../helpers');

const isBech32 = (address) => {
  if (!address) {
    return true;
  }

  try {
    bech32.decode(address);
    return true;
  } catch (error) {
    return false;
  }
};

const isInt = (string) => {
  if (!string) {
    return true;
  }

  const parsed = parseInt(string);
  return !isNaN(parsed) && parsed >= 0;
};

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'transactions';
    const key = 'txHash';
    const { hash } = pathParameters;
    let query = queryStringParameters;

    const schema = yup.object().shape({
      sender: yup.string().test('isBech32', 'sender', (address) => isBech32(address)),
      receiver: yup.string().test('isBech32', 'receiver', (address) => isBech32(address)),
      senderShard: yup.string().test('isInt', 'senderShard', (shard) => isInt(shard)),
      receiverShard: yup.string().test('isInt', 'receiverShard', (shard) => isInt(shard)),
      from: yup.string().test('isInt', 'from', (from) => isInt(from)),
      size: yup.string().test('isInt', 'size', (size) => isInt(size)),
    });

    // TODO: filter & sanitize data
    await schema.validate(query);

    let data;

    switch (true) {
      case hash !== undefined && hash === 'count': {
        data = await getCount({ collection, query });
        break;
      }
      case hash !== undefined: {
        data = await getItem({ collection, key, hash });
        break;
      }
      default: {
        const sort = {
          timestamp: 'desc',
          nonce: 'desc',
        };

        data = await getList({ collection, key, query, sort });
        break;
      }
    }

    return response({ data });
  } catch (error) {
    console.error('accounts error', error);
    return response({ status: 503 });
  }
};
