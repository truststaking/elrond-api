const { bech32, vmQuery, response } = require('./helpers');

const numberDecode = (encoded) => {
  const hex = Buffer.from(encoded, 'base64').toString('hex');
  return BigInt(hex ? '0x' + hex : hex).toString();
};

const { delegationContract } = require(`./configs/${process.env.CONFIG}`);

exports.handler = async ({ pathParameters }) => {
  try {
    let address;

    if (pathParameters && pathParameters.hash) {
      address = pathParameters.hash;
    }

    if (address) {
      const publicKey = bech32.decode(address);

      const [userStakeByTypeEncoded, claimableRewardsEncoded] = await Promise.all([
        vmQuery({
          contract: delegationContract,
          func: 'getUserStakeByType',
          args: [publicKey],
        }),
        vmQuery({
          contract: delegationContract,
          func: 'getClaimableRewards',
          args: [publicKey],
        }),
      ]);

      const [
        userWithdrawOnlyStake,
        userWaitingStake,
        userActiveStake,
        userUnstakedStake,
        userDeferredPaymentStake,
      ] = userStakeByTypeEncoded.map((encoded) => numberDecode(encoded));

      const claimableRewards = numberDecode(claimableRewardsEncoded[0]);

      const data = {
        userWithdrawOnlyStake,
        userWaitingStake,
        userActiveStake,
        userUnstakedStake,
        userDeferredPaymentStake,
        claimableRewards,
      };

      return response({ data });
    } else {
      const [totalStakeByTypeEncoded, numUsersEncoded] = await Promise.all([
        vmQuery({
          contract: delegationContract,
          func: 'getTotalStakeByType',
        }),
        vmQuery({
          contract: delegationContract,
          func: 'getNumUsers',
        }),
      ]);

      const [
        totalWithdrawOnlyStake,
        totalWaitingStake,
        totalActiveStake,
        totalUnstakedStake,
        totalDeferredPaymentStake,
      ] = totalStakeByTypeEncoded.map((encoded) => numberDecode(encoded));

      const numUsers = numberDecode(numUsersEncoded[0]);

      const data = {
        totalWithdrawOnlyStake,
        totalWaitingStake,
        totalActiveStake,
        totalUnstakedStake,
        totalDeferredPaymentStake,
        numUsers,
      };

      return response({ data });
    }
  } catch (error) {
    console.error('delegation error', error);
    return response({ status: 503 });
  }
};
