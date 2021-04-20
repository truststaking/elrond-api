const id = 'testnet-azure-all-in-one';
const name = 'Azure Maiar Dev Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';

const elasticUrls = ['http://35.207.191.245'];
const gatewayUrls = ['http://35.207.191.245:8080'];

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
