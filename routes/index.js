const indexRouter = require('./indexRouter');
const accountsRouter = require('./accountsRouter');
const blocksRouter = require('./blocksRouter');
const constantsRouter = require('./constantsRouter');
const deferredRouter = require('./deferredRouter');
const delegationLegacyRouter = require('./delegationLegacyRouter');
const delegationRouter = require('./delegationRouter');
const economicsRouter = require('./economicsRouter');
const identitiesRouter = require('./identitiesRouter');
const keysRouter = require('./keysRouter');
const mexRouter = require('./mexRouter');
const miniblocksRouter = require('./miniblocksRouter');
const nodesRouter = require('./nodesRouter');
const providersRouter = require('./providersRouter');
const proxyRouter = require('./proxyRouter');
const queueRouter = require('./queueRouter');
const roundsRouter = require('./roundsRouter');
const shardsRouter = require('./shardsRouter');
const rewardsHistoryRouter = require('./rewardsHistoryRouter');
const addressHistoryRouter = require('./addressHistoryRouter');
const stakeRouter = require('./stakeRouter');
const statsRouter = require('./statsRouter');
const tokensRouter = require('./tokensRouter');
const transactionsRouter = require('./transactionsRouter');
const unbondPeriodRouter = require('./unbondPeriodRouter');
const usernamesRouter = require('./usernamesRouter');
const waitingListRouter = require('./waitingListRouter');

module.exports = {
  indexRouter,
  accountsRouter,
  blocksRouter,
  constantsRouter,
  deferredRouter,
  delegationLegacyRouter,
  delegationRouter,
  economicsRouter,
  identitiesRouter,
  keysRouter,
  mexRouter,
  miniblocksRouter,
  nodesRouter,
  providersRouter,
  proxyRouter,
  queueRouter,
  roundsRouter,
  shardsRouter,
  stakeRouter,
  statsRouter,
  tokensRouter,
  rewardsHistoryRouter,
  addressHistoryRouter,
  transactionsRouter,
  unbondPeriodRouter,
  usernamesRouter,
  waitingListRouter,
};
