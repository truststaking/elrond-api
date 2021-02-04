const { handler: accountsHandler } = require('./accounts');
const { handler: blocksHandler } = require('./blocks');
const { handler: constantsHandler } = require('./constants');
const { handler: miniblocksHandler } = require('./miniblocks');
const { handler: nodesHandler } = require('./nodes');
const { handler: roundsHandler } = require('./rounds');
const { handler: tokensHandler } = require('./tokens');
const { handler: transactionsHandler } = require('./transactions');
const { handler: transactionsSendHandler } = require('./transactionSend');

module.exports = {
  accountsHandler,
  blocksHandler,
  constantsHandler,
  miniblocksHandler,
  nodesHandler,
  roundsHandler,
  tokensHandler,
  transactionsHandler,
  transactionsSendHandler,
};
