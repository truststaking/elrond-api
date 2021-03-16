const { handler: accountsHandler } = require('./accounts');
const { handler: blocksHandler } = require('./blocks');
const { handler: constantsHandler } = require('./constants');
const { handler: markersHandler } = require('./markers');
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
  markersHandler,
  miniblocksHandler,
  nodesHandler,
  roundsHandler,
  stakeHandler,
  tokensHandler,
  transactionsHandler,
  transactionsCreateHandler,
};
