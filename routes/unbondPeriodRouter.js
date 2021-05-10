const express = require('express');
const router = express.Router();
const { unbondPeriodHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get('/keys/:key/unbond-period', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await unbondPeriodHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
