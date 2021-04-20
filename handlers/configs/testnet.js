const configs = require('./config');
const apiUrl = 'https://testnet-api.elrond.com';
const elasticUrls = ['https://testnet-index.elrond.com'];
const gatewayUrls = ['https://testnet-gateway.elrond.com'];
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
  gatewayUrl,
  elasticUrl,
  vmQueryUrl,
  apiUrl,
  providersUrl,
  network,
  ...configs,
};
