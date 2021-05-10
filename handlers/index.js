const { handler: accessHandler } = require('./access');
const { handler: accountsHandler } = require('./accounts');
const { handler: blocksHandler } = require('./blocks');
const { handler: constantsHandler } = require('./constants');
const { handler: countryHandler } = require('./country');
const { handler: deferredHandler } = require('./deferred');
const { handler: delegationHandler } = require('./delegation');
const { handler: delegationLegacyHandler } = require('./delegationLegacy');
const { handler: economicsHandler } = require('./economics');
const { handler: identitiesHandler } = require('./identities');
const { handler: keysHandler } = require('./keys');
const { handler: markersHandler } = require('./markers');
const { handler: mexHandler } = require('./mex');
const { handler: miniblocksHandler } = require('./miniblocks');
const { handler: nodesHandler } = require('./nodes');
const { handler: prewarmHandler } = require('./prewarm');
const { handler: providersHandler } = require('./providers');
const { handler: proxyhandler } = require('./proxy');
const { handler: queueHandler } = require('./queue');
const { handler: roundsHandler } = require('./rounds');
const { handler: shardsHandler } = require('./shards');
const { handler: snapshotsHandler } = require('./snapshots');
const { handler: snapshotsQueueHandler } = require('./snapshotsQueue');
const { handler: stakeHandler } = require('./stake');
const { handler: stakePoolHandler } = require('./stakePool');
const { handler: statsHandler } = require('./stats');
const { handler: subscribeHandler } = require('./subscribe');
const { handler: tokensHandler } = require('./tokens');
const { handler: transactionsHandler } = require('./transactions');
const { handler: transactionsCreateHandler } = require('./transactionsCreate');
const { handler: unbondPeriodHandler } = require('./unbondPeriod');
const { handler: usernamesHandler } = require('./usernames');
const { handler: waitingListHandler } = require('./waitingList');

module.exports = {
  accessHandler,
  accountsHandler,
  blocksHandler,
  constantsHandler,
  countryHandler,
  deferredHandler,
  delegationHandler,
  delegationLegacyHandler,
  economicsHandler,
  identitiesHandler,
  keysHandler,
  markersHandler,
  mexHandler,
  miniblocksHandler,
  nodesHandler,
  prewarmHandler,
  providersHandler,
  proxyhandler,
  queueHandler,
  roundsHandler,
  shardsHandler,
  snapshotsHandler,
  snapshotsQueueHandler,
  stakeHandler,
  stakePoolHandler,
  statsHandler,
  subscribeHandler,
  tokensHandler,
  transactionsHandler,
  transactionsCreateHandler,
  unbondPeriodHandler,
  usernamesHandler,
  waitingListHandler,
};
