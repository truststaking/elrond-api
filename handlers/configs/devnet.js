const configs = require('./config');
const urls = {
  elasticUrls: ['https://devnet-index.elrond.com'],
  gatewayUrls: ['https://devnet-gateway.elrond.com'],
};
const apiUrl = 'https://devnet-api.elrond.com';
const providersUrl = 'https://devnet-delegation.maiarbrowser.com/providers';

configs.buildUrls.call(urls);
delete configs.buildUrls;

const network = 'devnet';

module.exports = {
  ...configs,
  apiUrl,
  providersUrl,
  network,
};
