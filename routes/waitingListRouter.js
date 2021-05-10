const express = require('express');
const router = express.Router();
const { waitingListHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get(['/waiting-list', '/accounts/:hash/waiting-list'], async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await waitingListHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
