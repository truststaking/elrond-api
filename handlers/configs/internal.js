const configs = require('./config');
const apiUrl = 'https://internal-api.elrond.com';
const elasticUrls = ['https://internal-index.elrond.com'];
const gatewayUrls = ['https://internal-gateway.elrond.com'];
const providersUrl = 'https://internal-delegation-api.elrond.com/providers';

const elasticUrl = () => {
  return elasticUrls[Math.floor(Math.random() * elasticUrls.length)];
};

const gatewayUrl = () => {
  return gatewayUrls[Math.floor(Math.random() * gatewayUrls.length)];
};

const vmQueryUrl = () => {
  return gatewayUrl();
};

const network = 'mainnet';

module.exports = {
  gatewayUrl,
  elasticUrl,
  vmQueryUrl,
  apiUrl,
  providersUrl,
  network,
  ...configs,
};
