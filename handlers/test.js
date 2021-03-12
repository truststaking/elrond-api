const { getNodes, getNodesData } = require('./helpers');

(async () => {
  const nodes = await getNodes();

  const publicKeys = nodes
    .filter(({ nodeType }) => nodeType === 'validator')
    .map(({ publicKey }) => publicKey);

  const nodesData = await getNodesData({ publicKeys });

  console.log('nodesData', nodesData);
})();
