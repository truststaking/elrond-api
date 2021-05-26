const { axios, bech32, vmQuery, response } = require('./helpers');

const {
  gatewayUrl,
  delegationContract,
  delegationContractShardId,
} = require(`./configs/${process.env.CONFIG}`);

const decode = (value) => {
  const hex = Buffer.from(value, 'base64').toString('hex');
  return BigInt(hex ? '0x' + hex : hex).toString();
};

exports.handler = async ({ pathParameters }) => {
  try {
    const { hash } = pathParameters || {};
    const publicKey = bech32.decode(hash);

    const [
      encodedUserDeferredPaymentList,
      [encodedNumBlocksBeforeUnBond],
      {
        data: {
          data: {
            status: { erd_nonce: erdNonceString },
          },
        },
      },
    ] = await Promise.all([
      vmQuery({
        contract: delegationContract,
        func: 'getUserDeferredPaymentList',
        args: [publicKey],
      }),
      vmQuery({
        contract: delegationContract,
        func: 'getNumBlocksBeforeUnBond',
      }),
      axios.get(`${gatewayUrl()}/network/status/${delegationContractShardId}`),
    ]);

    const numBlocksBeforeUnBond = parseInt(decode(encodedNumBlocksBeforeUnBond));
    const erdNonce = parseInt(erdNonceString);

    const data = encodedUserDeferredPaymentList.reduce((result, value, index, array) => {
      if (index % 2 === 0) {
        const [encodedDeferredPayment, encodedUnstakedNonce] = array.slice(index, index + 2);

        const deferredPayment = decode(encodedDeferredPayment);
        const unstakedNonce = parseInt(decode(encodedUnstakedNonce));
        const blocksLeft = Math.max(0, unstakedNonce + numBlocksBeforeUnBond - erdNonce);
        const secondsLeft = blocksLeft * 6; // 6 seconds per block

        result.push({ deferredPayment, secondsLeft });
      }

      return result;
    }, []);

    return response({ data, cache: live });
  } catch (error) {
    console.error('deferred error', error);
    return response({ status: 503 });
  }
};
