const { stakingContract } = require(`../configs/${process.env.CONFIG}`);

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
      ({ type, status }) => type === 'validator' && ['eligible', 'waiting'].includes(status)
    ).length,
    activeValidators: nodes.filter(
      ({ type, status, online }) =>
        type === 'validator' && ['eligible', 'waiting'].includes(status) && online === true
    ).length,
    queueSize: parseInt(Buffer.from(queueSize, 'base64').toString()),
  };
};

module.exports = getValidators;
