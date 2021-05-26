const {
  dns: { normalizeName, getContract, encodeName },
  bech32,
  vmQuery,
  response,
  cache: { getCache, putCache },
} = require('./helpers');

exports.handler = async ({ pathParameters }) => {
  const { username } = pathParameters || {};
  const key = normalizeName(username);

  const cached = await getCache({ key });

  if (cached) {
    if (!cached.headers) {
      cached.headers = {};
    }

    cached.headers['x-cache'] = 'true';

    return response(cached);
  }

  try {
    const contract = getContract(username);
    const encoded = encodeName(username);

    const [encodedAddress] = await vmQuery({
      contract,
      func: 'resolve',
      args: [encoded],
    });

    if (encodedAddress) {
      const publicKey = Buffer.from(encodedAddress, 'base64').toString('hex');
      const address = bech32.encode(publicKey);

      const value = { status: 301, headers: { location: `/accounts/${address}` } };

      await putCache({ key, value, ttl: 604800 }); // 1 week

      return response(value);
    }
  } catch (error) {
    console.error('usernames error', error);
  }

  const value = { status: 404 };

  await putCache({ key, value, ttl: 600 }); // 10 minutes

  return response(value);
};
