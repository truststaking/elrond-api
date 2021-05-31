const { vmQuery, response } = require('./helpers');

const { stakingContract } = require(`./configs/${process.env.CONFIG}`);

exports.handler = async ({ pathParameters }) => {
  try {
    const { key } = pathParameters || {};
    const encoded = await vmQuery({
      contract: stakingContract,
      func: 'getRemainingUnBondPeriod',
      args: [key],
    });

    let remainingUnBondPeriod = parseInt(Buffer.from(encoded[0], 'base64').toString('ascii'));

    if (isNaN(remainingUnBondPeriod)) {
      remainingUnBondPeriod = encoded[0].length
        ? parseInt(Buffer.from(encoded[0], 'base64').toString('hex'), 16)
        : 0;
    }

    const data = { remainingUnBondPeriod };

    return response({ data });
  } catch (error) {
    console.error('unbond period error', error);
    return response({ code: 503 });
  }
};
