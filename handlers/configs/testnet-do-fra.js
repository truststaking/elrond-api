const configs = require('./config');
const id = 'testnet-do-fra';
const name = 'DigitalOcean Frankfurt Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';
const apiUrl = 'https://testnet-api.elrond.com';
const elasticUrls = ['http://104.248.103.160'];
const gatewayUrls = ['http://144.126.246.1:8080'];
const providersUrl = 'https://delegation.maiarbrowser.com/providers';

const elasticUrl = () => {
  return elasticUrls[Math.floor(Math.random() * elasticUrls.length)];
};

const gatewayUrl = () => {
  return gatewayUrls[Math.floor(Math.random() * gatewayUrls.length)];
};

const vmQueryUrl = () => {
  return gatewayUrl();
};

const network = 'testnet';

module.exports = {
  id,
  name,
  adapter,
  erdLabel,
  theme,
  gatewayUrl,
  elasticUrl,
  vmQueryUrl,
  apiUrl,
  providersUrl,
  network,
  ...configs,
};
