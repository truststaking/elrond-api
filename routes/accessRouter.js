const express = require('express');
const router = express.Router();
const { accessHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.post('/access', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await accessHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
