const configs = require('./config');
const urls = {
  elasticUrls: ['https://testnet-index.elrond.com'],
  gatewayUrls: ['https://testnet-gateway.elrond.com'],
};
const apiUrl = 'https://testnet-api.elrond.com';
const providersUrl = 'https://delegation.maiarbrowser.com/providers';

configs.buildUrls.call(urls);
delete configs.buildUrls;

const network = 'testnet';

module.exports = {
  apiUrl,
  providersUrl,
  network,
  ...configs,
};
