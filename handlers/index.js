const { handler: accountsHandler } = require('./accounts');
const { handler: blocksHandler } = require('./blocks');
const { handler: constantsHandler } = require('./constants');
const { handler: deferredHandler } = require('./deferred');
const { handler: delegationHandler } = require('./delegation');
const { handler: delegationLegacyHandler } = require('./delegationLegacy');
const { handler: economicsHandler } = require('./economics');
const { handler: miniblocksHandler } = require('./miniblocks');
const { handler: nodesHandler } = require('./nodes');
const { handler: roundsHandler } = require('./rounds');
const { handler: stakeHandler } = require('./stake');
const { handler: tokensHandler } = require('./tokens');
const { handler: transactionsHandler } = require('./transactions');
const { handler: transactionsCreateHandler } = require('./transactionsCreate');

module.exports = {
  accountsHandler,
  blocksHandler,
  constantsHandler,
  deferredHandler,
  delegationHandler,
  delegationLegacyHandler,
  economicsHandler,
  miniblocksHandler,
  nodesHandler,
  roundsHandler,
  stakeHandler,
  tokensHandler,
  transactionsHandler,
  transactionsCreateHandler,
};
