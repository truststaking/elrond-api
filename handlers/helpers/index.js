const { axios, setForwardedHeaders } = require('./axiosWrapper');
const batchProcess = require('./batchProcess');
const bech32 = require('./bech32');
const cache = require('./cache');
const computeShard = require('./computeShard');
const confirmKeybase = require('./confirmKeybase');
const dns = require('./dns');
const elasticSearch = require('./elasticSearch');
const getAccess = require('./getAccess');
const getChunks = require('./getChunks');
const getHeartbeat = require('./getHeartbeat');
const getLocations = require('./getLocations');
const getMarkers = require('./getMarkers');
const getNodes = require('./getNodes');
const getOwners = require('./getOwners');
const getProfile = require('./getProfile');
const getProviders = require('./getProviders');
const getQueue = require('./getQueue');
const getStakes = require('./getStakes');
const getTokenProperties = require('./getTokenProperties');
const getTokens = require('./getTokens');
const getValidators = require('./getValidators');
const reverseGeocoding = require('./reverseGeocoding');
const response = require('./response');
const s3Cache = require('./s3Cache');
const sendgrid = require('./sendgrid');
const vmQuery = require('./vmQuery');
const padHex = (value) => (value.length % 2 ? '0' + value : value);

module.exports = {
  axios,
  setForwardedHeaders,
  batchProcess,
  bech32,
  cache,
  computeShard,
  confirmKeybase,
  dns,
  elasticSearch,
  getAccess,
  getChunks,
  getHeartbeat,
  getLocations,
  getMarkers,
  getNodes,
  getOwners,
  getProfile,
  getProviders,
  getQueue,
  getStakes,
  getTokenProperties,
  getTokens,
  getValidators,
  reverseGeocoding,
  response,
  s3Cache,
  sendgrid,
  vmQuery,
  padHex,
};
