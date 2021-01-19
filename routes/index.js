const indexRouter = require('./indexRouter');
const accountsRouter = require('./accountsRouter');
const blocksRouter = require('./blocksRouter');
const constantsRouter = require('./constantsRouter');
const elasticSearchRouter = require('./elasticSearchRouter');
const miniblocksRouter = require('./miniblocksRouter');
const nodesRouter = require('./nodesRouter');
const tokensRouter = require('./tokensRouter');
const transactionsRouter = require('./transactionsRouter');

module.exports = {
  indexRouter,
  accountsRouter,
  blocksRouter,
  constantsRouter,
  elasticSearchRouter,
  miniblocksRouter,
  nodesRouter,
  tokensRouter,
  transactionsRouter,
};
