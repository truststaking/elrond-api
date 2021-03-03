const express = require('express');
const router = express.Router();
const { constantsHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get('/constants', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await constantsHandler();

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
