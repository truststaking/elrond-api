const id = 'testnet-azure-all-in-one-maiar';
const name = 'Maiar API All-In-One Testnet';
const adapter = 'elastic';
const erdLabel = 'XeGLD';
const theme = 'testnet';
const elasticUrls = ['https://elastic-maiar.elrond.com'];
const gatewayUrls = ['https://proxy-maiar.elrond.com'];

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
