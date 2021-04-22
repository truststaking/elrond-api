const configs = require('./config');
const urls = {
  elasticUrls: ['https://index.elrond.com'],
  gatewayUrls: ['https://gateway.elrond.com'],
};
const apiUrl = 'https://api.elrond.com';
const providersUrl = 'https://internal-delegation-api.elrond.com/providers';

configs.buildUrls.call(urls);
delete configs.buildUrls;

const delegationContract = 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt';

const network = 'mainnet';

module.exports = {
  ...configs,
  apiUrl,
  providersUrl,
  delegationContract,
  network,
};
