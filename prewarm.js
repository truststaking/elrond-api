require('dotenv').config();
const { availableContracts, getNodes, getTokens } = require('./handlers/helpers');

(async () => {
  if ((await availableContracts()) !== 'ContractsUnavailable') {
    await getNodes({ skipCache: true });
    await getTokens({ skipCache: true });
  } else {
    console.log('Prewarm will stop...');
  }

  process.exit(0);
})();
