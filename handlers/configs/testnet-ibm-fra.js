const id = 'testnet-ibm-fra';
const name = 'IBM FRA MULTI Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';

const elasticUrls = ['http://158.177.2.44'];
const gatewayUrls = ['http://158.177.11.22:8080'];

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
