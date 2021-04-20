const {
  axios,
  cache: { getCache, putCache },
  setForwardedHeaders,
  vmQuery,
  response,
} = require('./helpers');

const {
  gatewayUrl,
  delegationContract,
  auctionContract,
  cache: { moderate },
} = require(`./configs/${process.env.CONFIG}`);

const locked = 4020000;

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  const { extract } = queryStringParameters || {};

  try {
    const key = 'economics';

    const cached = await getCache({ key });

    if (cached) {
      return response({ data: cached, extract, cache: moderate });
    }

    const [
      {
        data: {
          data: {
            account: { balance },
          },
        },
      },
      {
        data: {
          data: {
            metrics: { erd_total_staked_value, erd_total_supply },
          },
        },
      },
      [, totalWaitingStakeBase64],
    ] = await Promise.all([
      axios.get(`${gatewayUrl()}/address/${auctionContract}`),
      axios.get(`${gatewayUrl()}/network/economics`),
      vmQuery({
        contract: delegationContract,
        func: 'getTotalStakeByType',
      }),
    ]);

    const totalWaitingStakeHex = Buffer.from(totalWaitingStakeBase64, 'base64').toString('hex');
    let totalWaitingStake = BigInt(
      totalWaitingStakeHex ? '0x' + totalWaitingStakeHex : totalWaitingStakeHex
    );

    const staked = parseInt((BigInt(balance) + totalWaitingStake).toString().slice(0, -18));
    const totalSupply = parseInt(erd_total_supply.slice(0, -18));

    const circulatingSupply = totalSupply - locked;

    const data = { totalSupply, circulatingSupply, staked };

    await putCache({ key, value: data, ttl: 600 }); // 10m

    return response({ data, extract, cache: moderate });
  } catch (error) {
    console.error('economics error', error);
    return response({ status: 503 });
  }
};
