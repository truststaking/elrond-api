const { bech32, vmQuery, padHex, response, setForwardedHeaders } = require('./helpers');

const {
  auctionContract,
  stakingContract,
  cache: { moderate },
} = require(`./configs/${process.env.CONFIG}`);

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  try {
    const { hash } = pathParameters || {};
    const publicKey = bech32.decode(hash);

    const BlsKeysStatus = await vmQuery({
      contract: auctionContract,
      func: 'getBlsKeysStatus',
      caller: auctionContract,
      args: [publicKey],
    });

    const queued = [];

    const data = BlsKeysStatus.reduce((result, value, index, array) => {
      if (index % 2 === 0) {
        const [encodedBlsKey, encodedStatus] = array.slice(index, index + 2);

        const blsKey = padHex(Buffer.from(encodedBlsKey, 'base64').toString('hex'));
        const status = Buffer.from(encodedStatus, 'base64').toString();
        const stake = '2500000000000000000000';

        if (status === 'queued') {
          queued.push(blsKey);
        }

        result.push({ blsKey, stake, status });
      }
      return result;
    }, []);

    if (data && data[0] && data[0].blsKey) {
      const [encodedRewardsPublicKey] = await vmQuery({
        contract: stakingContract,
        func: 'getRewardAddress',
        args: [data[0].blsKey],
      });

      const rewardsPublicKey = Buffer.from(encodedRewardsPublicKey, 'base64').toString();
      const rewardAddress = bech32.encode(rewardsPublicKey);

      data.forEach((key, index) => {
        data[index].rewardAddress = rewardAddress;
      });
    }

    if (queued.length) {
      const results = await Promise.all([
        vmQuery({
          contract: stakingContract,
          func: 'getQueueSize',
        }),
        ...queued.map((blsKey) =>
          vmQuery({
            contract: stakingContract,
            func: 'getQueueIndex',
            caller: auctionContract,
            args: [blsKey],
          })
        ),
      ]);

      let queueSize;
      results.forEach(([result], index) => {
        if (index === 0) {
          queueSize = Buffer.from(result, 'base64').toString();
        } else {
          const [found] = data.filter(({ blsKey }) => {
            return blsKey === queued[index - 1];
          });

          found.queueIndex = Buffer.from(result, 'base64').toString();
          found.queueSize = queueSize;
        }
      });
    }

    return response({ data, cache: moderate });
  } catch (error) {
    console.error('keys error', error);
    return response({ data: [], cache: moderate });
  }
};
