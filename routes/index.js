const indexRouter = require('./indexRouter');
const accountsRouter = require('./accountsRouter');
const constantsRouter = require('./constantsRouter');
const elasticSearchRouter = require('./elasticSearchRouter');
const nodesRouter = require('./nodesRouter');
const tokensRouter = require('./tokensRouter');
const transactionsRouter = require('./transactionsRouter');

module.exports = {
  indexRouter,
  accountsRouter,
  constantsRouter,
  elasticSearchRouter,
  nodesRouter,
  tokensRouter,
  transactionsRouter,
};
