const {
  bech32,
  vmQuery,
  cache: { putCache, getCache },
  response,
} = require('./helpers');

const {
  stakingContract,
  auctionContract,
  cache: { moderate, skip },
} = require(`./configs/${process.env.CONFIG}`);

exports.handler = async () => {
  try {
    // let queue = await getCache({ key: 'queue' });
    let queue = null;

    if (!queue) {
      const queueEncoded = await vmQuery({
        contract: stakingContract,
        func: 'getQueueRegisterNonceAndRewardAddress',
        caller: auctionContract,
      });

      queue = queueEncoded.reduce((result, value, index, array) => {
        if (index % 3 === 0) {
          const [, publicKeyEncoded, nonceEncoded] = array.slice(index, index + 3);

          const publicKey = Buffer.from(publicKeyEncoded, 'base64').toString('hex');
          const address = bech32.encode(publicKey);
          const nonceHex = Buffer.from(nonceEncoded, 'base64').toString('hex');
          const nonce = parseInt(BigInt(nonceHex ? '0x' + nonceHex : nonceHex).toString());

          result.push({ address, nonce });
        }

        return result;
      }, []);

      await putCache({ key: 'queue', value: queue, ttl: 60 });
    }

    let data = queue;

    return response({ data, cache: moderate });
  } catch (error) {
    console.error('error', error);
    return response({ data: [], cache: skip });
  }
};
