const indexRouter = require('./indexRouter');
const accountsRouter = require('./accountsRouter');
const blocksRouter = require('./blocksRouter');
const constantsRouter = require('./constantsRouter');
const deferredRouter = require('./deferredRouter');
const delegationLegacyRouter = require('./delegationLegacyRouter');
const delegationRouter = require('./delegationRouter');
const economicsRouter = require('./economicsRouter');
const keysRouter = require('./keysRouter');
const miniblocksRouter = require('./miniblocksRouter');
const nodesRouter = require('./nodesRouter');
const providersRouter = require('./providersRouter');
const roundsRouter = require('./roundsRouter');
const shardsRouter = require('./shardsRouter');
const stakeRouter = require('./stakeRouter');
const statsRouter = require('./statsRouter');
const tokensRouter = require('./tokensRouter');
const transactionsRouter = require('./transactionsRouter');
const allTransactionsRouter = require('./allTransactionsRouter');
const addressHistoryRouter = require('./addressHistoryRouter');
const rewardsHistoryRouter = require('./rewardsHistoryRouter');

module.exports = {
  indexRouter,
  accountsRouter,
  blocksRouter,
  constantsRouter,
  deferredRouter,
  delegationLegacyRouter,
  delegationRouter,
  economicsRouter,
  keysRouter,
  miniblocksRouter,
  nodesRouter,
  providersRouter,
  roundsRouter,
  shardsRouter,
  stakeRouter,
  statsRouter,
  tokensRouter,
  transactionsRouter,
  allTransactionsRouter,
  addressHistoryRouter,
  rewardsHistoryRouter,
};
