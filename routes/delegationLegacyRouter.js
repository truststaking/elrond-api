const express = require('express');
const router = express.Router();
const { delegationLegacyHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get(['/delegation-legacy', '/accounts/:hash/delegation-legacy'], async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await delegationLegacyHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
