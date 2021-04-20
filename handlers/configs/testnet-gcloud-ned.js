const configs = require('./config');
const id = 'testnet-gcloud-ned';
const name = 'Gcloud Nederlands Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';
const apiUrl = 'https://testnet-api.elrond.com';
const elasticUrls = ['http://35.214.254.189'];
const gatewayUrls = ['http://35.214.181.1:8080'];
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
