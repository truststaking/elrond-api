const { stakingContract } = require('../configs/config');

const getNodes = require('./getNodes');
const vmQuery = require('./vmQuery');

const getValidators = async () => {
  const [[queueSize], nodes] = await Promise.all([
    vmQuery({
      contract: stakingContract,
      func: 'getQueueSize',
    }),
    getNodes(),
  ]);

  return {
    totalValidators: nodes.filter(
      ({ nodeType, peerType }) =>
        nodeType === 'validator' && ['eligible', 'waiting'].includes(peerType)
    ).length,
    activeValidators: nodes.filter(
      ({ nodeType, peerType, status }) =>
        nodeType === 'validator' &&
        ['eligible', 'waiting'].includes(peerType) &&
        status === 'online'
    ).length,
    queueSize: parseInt(Buffer.from(queueSize, 'base64').toString()),
  };
};

module.exports = getValidators;
