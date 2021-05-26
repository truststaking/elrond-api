const {
  cache: { getCache, putCache },
  getProviders,
  getStakes,
  vmQuery,
  response,
} = require('./helpers');

const { delegationManagerContract, network } = require(`./configs/${process.env.CONFIG}`);

exports.handler = async () => {
  try {
    const key = 'delegation';

    const cached = await getCache({ key });

    if (cached) {
      return response({ data: cached });
    }

    const [providers, configsBase64] = await Promise.all([
      getProviders(),
      vmQuery({
        contract: delegationManagerContract,
        func: 'getContractConfig',
      }),
    ]);

    const minDelegationHex = Buffer.from(configsBase64.pop(), 'base64').toString('hex');
    const minDelegation = BigInt(
      minDelegationHex ? '0x' + minDelegationHex : minDelegationHex
    ).toString();

    const addresses = providers.map(({ provider }) => provider);

    const stakes = await getStakes({ addresses });

    const { stake, topUp } = stakes.reduce(
      (accumulator, { stake, topUp }) => {
        accumulator.stake += BigInt(stake);
        accumulator.topUp += BigInt(topUp);

        return accumulator;
      },
      {
        stake: BigInt(0),
        topUp: BigInt(0),
      }
    );

    const data = {
      stake: stake.toString(),
      topUp: topUp.toString(),
      locked: (stake + topUp).toString(),
      minDelegation,
    };

    await putCache({ key, value: data, ttl: 600 }); // 10m

    return response({ data });
  } catch (error) {
    if (network === 'mainnet') {
      console.error('delegation error', error);

      return response({ status: 503 });
    } else {
      const data = {
        stake: '0',
        topUp: '0',
        locked: '0',
        minDelegation: '0',
      };

      return response({ data });
    }
  }
};
