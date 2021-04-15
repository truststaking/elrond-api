const indexRouter = require('./indexRouter');
const accountsRouter = require('./accountsRouter');
const blocksRouter = require('./blocksRouter');
const constantsRouter = require('./constantsRouter');
const deferredRouter = require('./deferredRouter');
const delegationLegacyRouter = require('./delegationLegacyRouter');
const delegationRouter = require('./delegationRouter');
const economicsRouter = require('./economicsRouter');
const miniblocksRouter = require('./miniblocksRouter');
const nodesRouter = require('./nodesRouter');
const roundsRouter = require('./roundsRouter');
const stakeRouter = require('./stakeRouter');
const tokensRouter = require('./tokensRouter');
const transactionsRouter = require('./transactionsRouter');

module.exports = {
  indexRouter,
  accountsRouter,
  blocksRouter,
  constantsRouter,
  deferredRouter,
  delegationLegacyRouter,
  delegationRouter,
  economicsRouter,
  miniblocksRouter,
  nodesRouter,
  roundsRouter,
  stakeRouter,
  tokensRouter,
  transactionsRouter,
};
