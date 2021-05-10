const express = require('express');
const router = express.Router();
const { countryHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.post('/country', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await countryHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
