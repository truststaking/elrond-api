const configs = require('./config');
const apiUrl = 'https://beta-api.elrond.com';
const elasticUrls = ['https://index.elrond.com'];
const gatewayUrls = ['https://gateway.elrond.com'];
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
  ...configs,
  gatewayUrl,
  elasticUrl,
  vmQueryUrl,
  apiUrl,
  providersUrl,
  network,
};
