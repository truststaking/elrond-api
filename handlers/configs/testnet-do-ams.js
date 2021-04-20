const configs = require('./config');
const id = 'testnet-do-ams';
const name = 'DigitalOcean Amsterdam Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';
const apiUrl = 'https://testnet-api.elrond.com';
const elasticUrls = ['http://64.225.81.116'];
const gatewayUrls = ['http://161.35.247.163:8080'];
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
