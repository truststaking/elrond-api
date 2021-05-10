const { getAccess, response } = require('./helpers');

const {
  cache: { skip },
} = require(`./configs/${process.env.CONFIG}`);

exports.handler = async () => {
  const access = getAccess();

  return response({
    data: '',
    headers: {
      'x-access': access,
    },
    cache: skip,
  });
};
