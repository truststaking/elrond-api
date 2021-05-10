const express = require('express');
const router = express.Router();
const { queueHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get('/queue', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await queueHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
