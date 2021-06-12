const config = {
  elasticUrls: [],
  gatewayUrls: [],
  elasticUrl: () => {
    return config.elasticUrls[Math.floor(Math.random() * config.elasticUrls.length)];
  },
  gatewayUrl: function () {
    return config.gatewayUrls[Math.floor(Math.random() * config.gatewayUrls.length)];
  },
  vmQueryUrl: function () {
    return config.gatewayUrl();
  },
  metaChainShard: 4294967295,
  esdtContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u',
  delegationContract: 'erd1qqqqqqqqqqqqqpgqp699jngundfqw07d8jzkepucvpzush6k3wvqyc44rx',
  delegationContractShardId: 2,
  auctionContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l',
  stakingContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7',
  delegationManagerContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6',
  genesisTime: 1596117600,
  cacheTtl: 6,
  processTtl: 600,
  poolLimit: 10,
  processLimit: 500,
  redisUrl: '',
  statuses: {
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
  },
  axiosConfig: {
    maxRedirects: 0,
    timeout: 10000,
  },
};

module.exports = config;
