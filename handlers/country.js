const { response } = require('./helpers');

const {
  cache: { skip },
} = require(`./configs/${process.env.CONFIG}`);

exports.handler = async ({ headers }) => {
  let country = false;

  if (headers && headers['CloudFront-Viewer-Country']) {
    country = headers['CloudFront-Viewer-Country'];
  }

  return response({ data: { country }, cache: skip });
};
