const id = 'testnet-do-fra';
const name = 'DigitalOcean Frankfurt Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';

const elasticUrls = ['http://104.248.103.160'];
const gatewayUrls = ['http://144.126.246.1:8080'];

const elasticUrl = () => {
  return elasticUrls[Math.floor(Math.random() * elasticUrls.length)];
};

const gatewayUrl = () => {
  return gatewayUrls[Math.floor(Math.random() * gatewayUrls.length)];
};

module.exports = {
  id,
  name,
  adapter,
  erdLabel,
  theme,
  gatewayUrl,
  elasticUrl,
};
