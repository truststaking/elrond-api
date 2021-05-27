const {
  bech32,
  vmQuery,
  response,
  cache: { putCache, getCache },
} = require('./helpers');

const { delegationContract } = require(`./configs/${process.env.CONFIG}`);

const decode = (value) => {
  const hex = Buffer.from(value, 'base64').toString('hex');
  return BigInt(hex ? '0x' + hex : hex).toString();
};

exports.handler = async ({ pathParameters }) => {
  try {
    let address;

    if (pathParameters && pathParameters.hash) {
      address = pathParameters.hash;
    }

    let ranks = await getCache({ key: 'waiting-list' });
    let headers = { 'x-cached': 'true' };

    if (!ranks) {
      const fullWaitingListEncoded = await vmQuery({
        contract: delegationContract,
        func: 'getFullWaitingList',
      });

      if (fullWaitingListEncoded !== 'ContractsUnavailable') {
        const fullWaitingList = fullWaitingListEncoded.reduce((result, value, index, array) => {
          if (index % 3 === 0) {
            const [publicKeyEncoded, valueEncoded, nonceEncoded] = array.slice(index, index + 3);

            const publicKey = Buffer.from(publicKeyEncoded, 'base64').toString('hex');
            const address = bech32.encode(publicKey);
            const value = decode(valueEncoded);
            const nonce = parseInt(decode(nonceEncoded));

            result.push({ address, value, nonce });
          }

          return result;
        }, []);

        ranks = fullWaitingList.map((element, index) => {
          element.rank = index + 1;
          return element;
        });

        await putCache({ key: 'waiting-list', value: ranks, ttl: 300 });
      }
      headers = { 'x-cached': 'false' };
    }

    let data = ranks || false;

    if (ranks) {
      if (address) {
        data = data.filter((element) => {
          return element.address === address;
        });
      }
    }

    return response({ data, headers });
  } catch (error) {
    console.error('waiting-list error', error);
    return response({ status: 503 });
  }
};
