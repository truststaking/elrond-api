const { handler: accountsHandler } = require('./accounts');
const { handler: blocksHandler } = require('./blocks');
const { handler: constantsHandler } = require('./constants');
const { handler: elasticSearchHandler } = require('./elasticSearch');
const { handler: miniblocksHandler } = require('./miniblocks');
const { handler: nodesHandler } = require('./nodes');
const { handler: tokensHandler } = require('./tokens');
const { handler: transactionsHandler } = require('./transaction');

module.exports = {
  accountsHandler,
  blocksHandler,
  constantsHandler,
  elasticSearchHandler,
  miniblocksHandler,
  nodesHandler,
  tokensHandler,
  transactionsHandler,
};
