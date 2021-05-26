const vmQuery = require('./vmQuery');

const { stakingContract, auctionContract } = require(`../configs/${process.env.CONFIG}`);

const availableContracts = async () => {
  return await vmQuery({
    contract: stakingContract,
    func: 'getQueueRegisterNonceAndRewardAddress',
    caller: auctionContract,
  });
};

module.exports = availableContracts;
