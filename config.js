const elasticUrls = ['https://index.elrond.com'];
const gatewayUrls = ['https://gateway.elrond.com'];

const elasticUrl = () => {
  return elasticUrls[Math.floor(Math.random() * elasticUrls.length)];
};

const gatewayUrl = () => {
  return gatewayUrls[Math.floor(Math.random() * gatewayUrls.length)];
};

const redisUrl = '';

module.exports = {
  elasticUrl,
  gatewayUrl,
  redisUrl,
};
