const { handler: accountsHandler } = require('./accounts');
const { handler: blocksHandler } = require('./blocks');
const { handler: constantsHandler } = require('./constants');
const { handler: deferredHandler } = require('./deferred');
const { handler: delegationHandler } = require('./delegation');
const { handler: delegationLegacyHandler } = require('./delegationLegacy');
const { handler: economicsHandler } = require('./economics');
const { handler: identitiesHandler } = require('./identities');
const { handler: keysHandler } = require('./keys');
const { handler: mexHandler } = require('./mex');
const { handler: miniblocksHandler } = require('./miniblocks');
const { handler: nodesHandler } = require('./nodes');
const { handler: providersHandler } = require('./providers');
const { handler: proxyhandler } = require('./proxy');
const { handler: queueHandler } = require('./queue');
const { handler: roundsHandler } = require('./rounds');
const { handler: shardsHandler } = require('./shards');
const { handler: stakeHandler } = require('./stake');
const { handler: statsHandler } = require('./stats');
const { handler: tokensHandler } = require('./tokens');
const { handler: getProvidersAPRHandler } = require('./getProvidersAPR');
const { handler: transactionsHandler } = require('./transactions');
const { handler: transactionsCreateHandler } = require('./transactionsCreate');
const { handler: unbondPeriodHandler } = require('./unbondPeriod');
const { handler: usernamesHandler } = require('./usernames');
const { handler: rewardsHistory } = require('./rewardsHistory');
const { handler: waitingListHandler } = require('./waitingList');
const { handler: addressHistory } = require('./addressHistory');
const { handler: allTransactions } = require('./allTransactions');

module.exports = {
  accountsHandler,
  blocksHandler,
  constantsHandler,
  deferredHandler,
  delegationHandler,
  delegationLegacyHandler,
  economicsHandler,
  identitiesHandler,
  keysHandler,
  mexHandler,
  miniblocksHandler,
  nodesHandler,
  providersHandler,
  proxyhandler,
  queueHandler,
  roundsHandler,
  shardsHandler,
  stakeHandler,
  statsHandler,
  tokensHandler,
  transactionsHandler,
  transactionsCreateHandler,
  getProvidersAPRHandler,
  unbondPeriodHandler,
  usernamesHandler,
  waitingListHandler,
  rewardsHistory,
  addressHistory,
  allTransactions,
};
