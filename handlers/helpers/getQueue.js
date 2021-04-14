const vmQuery = require('./vmQuery');
const bech32 = require('./bech32');

const { stakingContract, auctionContract } = require(`../configs/config`);

const getQueue = async () => {
  const queueEncoded = await vmQuery({
    contract: stakingContract,
    func: 'getQueueRegisterNonceAndRewardAddress',
    caller: auctionContract,
  });

  let queue = [];

  if (queueEncoded) {
    queue = queueEncoded.reduce((result, value, index, array) => {
      if (index % 3 === 0) {
        const [blsBase64, rewardsBase64, nonceBase64] = array.slice(index, index + 3);

        const bls = Buffer.from(blsBase64, 'base64').toString('hex');

        const rewardsHex = Buffer.from(rewardsBase64, 'base64').toString('hex');
        const rewards = bech32.encode(rewardsHex);

        const nonceHex = Buffer.from(nonceBase64, 'base64').toString('hex');
        const nonce = parseInt(BigInt(nonceHex ? '0x' + nonceHex : nonceHex).toString());

        result.push({ bls, nonce, rewards });
      }

      return result;
    }, []);
  }

  return queue;
};

module.exports = getQueue;
