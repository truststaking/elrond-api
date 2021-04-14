const elasticUrls = ['https://devnet-index.elrond.com'];
const gatewayUrls = ['https://devnet-gateway.elrond.com'];

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

const auctionContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l';
const stakingContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7';
const delegationManagerContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6';

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

module.exports = {
  elasticUrl,
  gatewayUrl,
  vmQueryUrl,
  esdtContract,
  auctionContract,
  stakingContract,
  delegationManagerContract,
  redisUrl,
  cacheTtl,
  processTtl,
  poolLimit,
  statuses,
  network,
};
