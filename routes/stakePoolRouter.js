const express = require('express');
const router = express.Router();
const { stakePoolHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get(['/stake-pool', '/accounts/:hash/stake-pool'], async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await stakePoolHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
