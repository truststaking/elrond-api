const express = require('express');
const router = express.Router();
const { statsHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get('/stats', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await statsHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
