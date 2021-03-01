const elasticUrls = ['https://index.elrond.com'];
const gatewayUrls = ['https://gateway.elrond.com'];

const elasticUrl = () => {
  return elasticUrls[Math.floor(Math.random() * elasticUrls.length)];
};

const gatewayUrl = () => {
  return gatewayUrls[Math.floor(Math.random() * gatewayUrls.length)];
};

const vmQueryUrl = () => {
  return gatewayUrl();
};

const esdtContract = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u';

const redisUrl = '';
const cacheTtl = 6;

const statuses = {
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

module.exports = {
  elasticUrl,
  gatewayUrl,
  vmQueryUrl,
  esdtContract,
  redisUrl,
  cacheTtl,
  statuses,
};
