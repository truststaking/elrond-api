const id = 'testnet-gcloud-ned';
const name = 'Gcloud Nederlands Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';

const elasticUrls = ['http://35.214.254.189'];
const gatewayUrls = ['http://35.214.181.1:8080'];

const elasticUrl = () => {
  return elasticUrls[Math.floor(Math.random() * elasticUrls.length)];
};

const gatewayUrl = () => {
  return gatewayUrls[Math.floor(Math.random() * gatewayUrls.length)];
};

module.exports = {
  id,
  name,
  adapter,
  erdLabel,
  theme,
  gatewayUrl,
  elasticUrl,
};
