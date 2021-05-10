const express = require('express');
const router = express.Router();
const { usernamesHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get('/usernames/:username', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await usernamesHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
