const express = require('express');
const router = express.Router();
const { stakeHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get(['/stake', '/accounts/:hash/stake'], async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await stakeHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
