const { encode } = require('./bech32');
const vmQuery = require('./vmQuery');

const {
  stakingContract,
  auctionContract,
  delegationManagerSC,
} = require(`../configs/${process.env.CONFIG}`);

const availableContracts = async () => {
  return await vmQuery({
    contract: stakingContract,
    func: 'getQueueRegisterNonceAndRewardAddress',
    caller: auctionContract,
  });
};

const availableProviders = async () => {
  const wallets = await vmQuery({
    contract: delegationManagerSC,
    func: 'getAllContractAddresses',
  });
  return wallets.map((SC) => encode(Buffer.from(SC, 'base64').toString('hex')));
};

module.exports = { availableContracts, availableProviders };
