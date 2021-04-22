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
  walletBucket: 'http://wallet.elrond.com.s3-website.us-east-1.amazonaws.com',
  esdtContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u',
  delegationContract: 'erd1qqqqqqqqqqqqqpgqp699jngundfqw07d8jzkepucvpzush6k3wvqyc44rx',
  delegationContractShardId: 2,
  auctionContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l',
  stakingContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7',
  delegationManagerContract: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6',
  cmcApiKey: '4188e8d9-5663-4e65-8a3f-03316e2effa5',
  googleMapsAPIKey: 'AIzaSyC9olIiUfjvhHophKy_jZ3_sBESMK1j0_o',
  genesisTime: 1596117600,
  cacheTtl: 6,
  processTtl: 600,
  poolLimit: 10,
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
  cache: {
    skip: 0, // no cache
    live: 3, // 3 seconds (half a round)
    moderate: 300, // 5 minutes
    final: 3600, // 1 hour (we don't expect this to ever change)
  },
};

module.exports = config;
