const express = require('express');
const router = express.Router();
const { rewardsHistory } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get(['/rewardsHistory'], async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await rewardsHistory({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
