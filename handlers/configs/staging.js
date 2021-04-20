const apiUrl = 'https://staging-api.elrond.com';
const elasticUrls = ['https://index.elrond.com'];
const gatewayUrls = ['https://gateway.elrond.com'];
const metaChainShard = 4294967295;
const providersUrl = 'https://internal-delegation-api.elrond.com/providers';

const elasticUrl = () => {
  return elasticUrls[Math.floor(Math.random() * elasticUrls.length)];
};

const gatewayUrl = () => {
  return gatewayUrls[Math.floor(Math.random() * gatewayUrls.length)];
};

const vmQueryUrl = () => {
  return gatewayUrl();
};

const esdtContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u';

const delegationContract = 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt';
const delegationContractShardId = 2;

const auctionContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l';
const stakingContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7';
const delegationManagerContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6';

const genesisTime = 1596117600;

const cacheTtl = 6;
const processTtl = 600; // 10 minutes
const poolLimit = 10;

const redisUrl = '';

const network = 'mainnet';

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
  gatewayUrl,
  elasticUrl,
  vmQueryUrl,
  apiUrl,
  providersUrl,
  esdtContract,
  delegationContract,
  delegationContractShardId,
  auctionContract,
  stakingContract,
  delegationManagerContract,
  genesisTime,
  cacheTtl,
  processTtl,
  poolLimit,
  metaChainShard,
  redisUrl,
  network,
  statuses,
  cache,
};
