const { handler: constantsHandler } = require('./constants');
const { handler: elasticSearchHandler } = require('./elasticSearch');
const { handler: tokensHandler } = require('./tokens');

module.exports = {
  constantsHandler,
  elasticSearchHandler,
  tokensHandler,
};
