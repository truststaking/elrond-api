const configs = require('./config');
const apiUrl = 'https://devnet-api.elrond.com';
const elasticUrls = ['https://devnet-index.elrond.com'];
const gatewayUrls = ['https://devnet-gateway.elrond.com'];
const providersUrl = 'https://devnet-delegation.maiarbrowser.com/providers';

const elasticUrl = () => {
  return elasticUrls[Math.floor(Math.random() * elasticUrls.length)];
};

const gatewayUrl = () => {
  return gatewayUrls[Math.floor(Math.random() * gatewayUrls.length)];
};

const vmQueryUrl = () => {
  return gatewayUrl();
};

const network = 'devnet';

module.exports = {
  gatewayUrl,
  elasticUrl,
  vmQueryUrl,
  apiUrl,
  providersUrl,
  network,
  ...configs,
};
