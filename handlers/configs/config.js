const metaChainShard = 4294967295;

const esdtContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u';

const delegationContract = 'erd1qqqqqqqqqqqqqpgqp699jngundfqw07d8jzkepucvpzush6k3wvqyc44rx';
const delegationContractShardId = 2;

const auctionContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l';
const stakingContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7';
const delegationManagerContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6';

const cacheTtl = 6;
const processTtl = 600; // 10 minutes
const poolLimit = 10;

const redisUrl = '';

const statuses = {
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

const cache = {
  skip: 0, // no cache
  live: 3, // 3 seconds (half a round)
  moderate: 300, // 5 minutes
  final: 3600, // 1 hour (we don't expect this to ever change)
};

module.exports = {
  metaChainShard,
  esdtContract,
  delegationContract,
  delegationContractShardId,
  auctionContract,
  stakingContract,
  delegationManagerContract,
  redisUrl,
  cacheTtl,
  processTtl,
  poolLimit,
  statuses,
  cache,
};
