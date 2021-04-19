const axios = require('axios');

const {
  getValidators,
  vmQuery,
  response,
  cache: { getCache, putCache },
  bech32,
  setForwardedHeaders,
} = require('./helpers');

const {
  auctionContract,
  gatewayUrl,
  cache: { live, moderate },
} = require(`./configs/${process.env.CONFIG}`);

let roundsPerEpoch, roundDuration, roundsPassed;

const getNetworkConfig = async () => {
  const [
    {
      data: {
        data: {
          config: { erd_round_duration, erd_rounds_per_epoch },
        },
      },
    },
    {
      data: {
        data: {
          status: { erd_rounds_passed_in_current_epoch },
        },
      },
    },
  ] = await Promise.all([
    axios.get(`${gatewayUrl()}/network/config`),
    axios.get(`${gatewayUrl()}/network/status/4294967295`),
  ]);

  roundsPassed = erd_rounds_passed_in_current_epoch;
  roundsPerEpoch = erd_rounds_per_epoch;
  roundDuration = erd_round_duration / 1000;

  return { roundsPassed, roundsPerEpoch, roundDuration };
};

const getExpires = ({ epochs, roundsPassed, roundsPerEpoch, roundDuration }) => {
  const now = Math.floor(Date.now() / 1000);

  if (epochs === 0) {
    return now;
  }

  const fullEpochs = (epochs - 1) * roundsPerEpoch * roundDuration;
  const lastEpoch = (roundsPerEpoch - roundsPassed) * roundDuration;

  // console.log('expires', JSON.stringify({ epochs, roundsPassed, roundsPerEpoch, roundDuration }));

  return now + fullEpochs + lastEpoch;
};

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
}) => {
  let address;

  if (pathParameters && pathParameters.hash) {
    address = pathParameters.hash;
  }

  if (address) {
    await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

    try {
      const [totalStakedEncoded, unStakedTokensListEncoded] = await Promise.all([
        vmQuery({
          contract: auctionContract,
          func: 'getTotalStaked',
          caller: address,
        }),
        vmQuery({
          contract: auctionContract,
          func: 'getUnStakedTokensList',
          caller: address,
          args: [bech32.decode(address)],
        }),
      ]);

      const data = {
        totalStaked: Buffer.from(totalStakedEncoded[0], 'base64').toString('ascii'),
        unstakedTokens: undefined,
      };

      if (unStakedTokensListEncoded) {
        data.unstakedTokens = unStakedTokensListEncoded.reduce((result, value, index, array) => {
          if (index % 2 === 0) {
            const [encodedAmount, encodedEpochs] = array.slice(index, index + 2);

            const amountHex = Buffer.from(encodedAmount, 'base64').toString('hex');
            const amount = BigInt(amountHex ? '0x' + amountHex : amountHex).toString();

            const epochsHex = Buffer.from(encodedEpochs, 'base64').toString('hex');
            const epochs = parseInt(BigInt(epochsHex ? '0x' + epochsHex : epochsHex).toString());

            result.push({ amount, epochs });
          }

          return result;
        }, []);

        const networkConfig = await getNetworkConfig();

        for (const element of data.unstakedTokens) {
          element.expires = element.epochs
            ? getExpires({ epochs: element.epochs, ...networkConfig })
            : undefined;
          delete element.epochs;
        }
      }

      return response({ data, cache: live });
    } catch (error) {
      console.error('stake error', error);

      const data = { totalStaked: '0' };

      return response({ data, cache: live });
    }
  } else {
    try {
      const key = 'stake';

      let data = null;
      // await getCache({ key });

      if (data) {
        return response({ data, cache: moderate });
      } else {
        const [
          validators,
          {
            data: {
              data: {
                metrics: { erd_total_staked_value: totalStaked },
              },
            },
          },
        ] = await Promise.all([getValidators(), axios.get(`${gatewayUrl()}/network/economics`)]);

        data = { ...validators, totalStaked };

        await putCache({ key, value: data, ttl: 600 }); // 10m
      }

      return response({ data, cache: moderate });
    } catch (error) {
      console.error('stake', error);
      return response({ status: 503 });
    }
  }
};
