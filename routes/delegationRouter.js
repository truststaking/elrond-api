const express = require('express');
const router = express.Router();
const { delegationHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get('/delegation', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await delegationHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
