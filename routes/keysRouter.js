const express = require('express');
const router = express.Router();
const { keysHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get('/accounts/:hash/keys', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await keysHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
