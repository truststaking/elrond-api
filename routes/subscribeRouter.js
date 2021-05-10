const express = require('express');
const router = express.Router();
const { subscribeHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.all('/subscribe', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await subscribeHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
