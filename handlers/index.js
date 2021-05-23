const { handler: accountsHandler } = require('./accounts');
const { handler: blocksHandler } = require('./blocks');
const { handler: constantsHandler } = require('./constants');
const { handler: deferredHandler } = require('./deferred');
const { handler: delegationHandler } = require('./delegation');
const { handler: delegationLegacyHandler } = require('./delegationLegacy');
const { handler: economicsHandler } = require('./economics');
const { handler: keysHandler } = require('./keys');
const { handler: miniblocksHandler } = require('./miniblocks');
const { handler: nodesHandler } = require('./nodes');
const { handler: prewarmHandler } = require('./prewarm');
const { handler: providersHandler } = require('./providers');
const { handler: roundsHandler } = require('./rounds');
const { handler: shardsHandler } = require('./shards');
const { handler: stakeHandler } = require('./stake');
const { handler: statsHandler } = require('./stats');
const { handler: tokensHandler } = require('./tokens');
const { handler: transactionsHandler } = require('./transactions');
const { handler: transactionsCreateHandler } = require('./transactionsCreate');
const { handler: allTransactionsHandler } = require('./allTransactions');
const { handler: addressHistory } = require('./addressHistory');
const { handler: rewardsHistory } = require('./rewardsHistory');

module.exports = {
  accountsHandler,
  blocksHandler,
  constantsHandler,
  deferredHandler,
  delegationHandler,
  delegationLegacyHandler,
  economicsHandler,
  keysHandler,
  miniblocksHandler,
  nodesHandler,
  prewarmHandler,
  providersHandler,
  roundsHandler,
  shardsHandler,
  stakeHandler,
  statsHandler,
  tokensHandler,
  transactionsHandler,
  transactionsCreateHandler,
  allTransactionsHandler,
  addressHistory,
  rewardsHistory,
};
