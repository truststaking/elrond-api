const Csrf = require('csrf');

const csrf = new Csrf({ saltLength: 32 });

const { csrfSecret } = require(`../configs/${process.env.CONFIG}`);

const getAccess = () => {
  const expires = Math.floor(Date.now() / 1000) + 86400;
  return csrf.create(csrfSecret + expires) + '-' + expires;
};

module.exports = getAccess;
