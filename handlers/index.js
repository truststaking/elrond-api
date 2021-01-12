const { handler: accountsHandler } = require('./accounts');
const { handler: constantsHandler } = require('./constants');
const { handler: elasticSearchHandler } = require('./elasticSearch');
const { handler: nodesHandler } = require('./nodes');
const { handler: tokensHandler } = require('./tokens');
const { handler: transactionsHandler } = require('./transaction');

module.exports = {
  accountsHandler,
  constantsHandler,
  elasticSearchHandler,
  nodesHandler,
  tokensHandler,
  transactionsHandler,
};
