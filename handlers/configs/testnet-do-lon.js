const id = 'testnet-do-lon';
const name = 'DigitalOcean London Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';

const elasticUrls = ['http://138.68.116.15'];
const gatewayUrls = ['http://67.207.69.122:8080'];

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
