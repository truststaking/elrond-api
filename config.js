const elasticUrls = ['https://testnet-index.elrond.com'];
const gatewayUrls = ['https://testnet-gateway.elrond.com'];

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

const redisUrl = '';
const cacheTtl = 6;

module.exports = {
  elasticUrl,
  gatewayUrl,
  vmQueryUrl,
  esdtContract,
  redisUrl,
  cacheTtl,
};
