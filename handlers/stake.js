const { auctionContract } = require(`./configs/${process.env.CONFIG}`);
const { getValidators, vmQuery, response } = require('./helpers');

exports.handler = async ({ pathParameters }) => {
  const { hash } = pathParameters || {};

  if (hash) {
    try {
      const totalStakedEncoded = await vmQuery({
        contract: auctionContract,
        func: 'getTotalStaked',
        caller: hash,
      });

      const data = {
        totalStaked: Buffer.from(totalStakedEncoded[0], 'base64').toString('ascii'),
      };

      return response({ data });
    } catch (error) {
      console.error('stake error', error);

      const data = { totalStaked: '0' };

      return response({ data });
    }
  } else {
    try {
      const data = await getValidators();

      data.totalStaked = (data.totalValidators + data.queueSize) * 2500 + '000000000000000000';

      return response({ data });
    } catch (error) {
      console.error('stake', error);
      return response({ status: 503 });
    }
  }
};
