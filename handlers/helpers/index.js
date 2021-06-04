const availableContracts = require('./availableContracts');
const batchProcess = require('./batchProcess');
const bech32 = require('./bech32');
const cache = require('./cache');
const computeShard = require('./computeShard');
const confirmKeybase = require('./confirmKeybase');
const dns = require('./dns');
const elasticSearch = require('./elasticSearch');
const getChunks = require('./getChunks');
const getHeartbeat = require('./getHeartbeat');
const getNodes = require('./getNodes');
const getOwners = require('./getOwners');
const getProfile = require('./getProfile');
const getProviders = require('./getProviders');
const getQueue = require('./getQueue');
const getStakes = require('./getStakes');
const getTokenProperties = require('./getTokenProperties');
const getTokens = require('./getTokens');
const getValidators = require('./getValidators');
const response = require('./response');
const getRewardsHistory = require('./getRewardsHistory');
const vmQuery = require('./vmQuery');
const { setForwardedHeaders } = require('./axiosWrapper');
const getAddressHistory = require('./getAddressHistory');
const getAddressTransactions = require('./getAddressTransactions');
const padHex = (value) => (value.length % 2 ? '0' + value : value);
const { Phase3, getTimestampByEpoch, getEpoch } = require('./getEpoch')

module.exports = {
  availableContracts,
  batchProcess,
  bech32,
  cache,
  computeShard,
  confirmKeybase,
  dns,
  setForwardedHeaders,
  elasticSearch,
  getChunks,
  getHeartbeat,
  getNodes,
  getOwners,
  getProfile,
  getProviders,
  getQueue,
  getStakes,
  getTokenProperties,
  getTokens,
  getValidators,
  response,
  vmQuery,
  padHex,
  getRewardsHistory,
  getAddressHistory,
  getAddressTransactions,
  getEpoch,
  Phase3,
  getTimestampByEpoch,
};
