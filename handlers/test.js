const { getNodes, getOwners } = require('./helpers');

(async () => {
  const nodes = await getNodes({ skipCache: true });

  const validators = nodes.filter(({ nodeType }) => nodeType === 'validator');

  const blsKeys = validators.map(({ publicKey }) => publicKey);

  const owners = await getOwners(blsKeys);

  console.log('owners', owners);
})();
