const express = require('express');
const router = express.Router();
const { tokensHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get(
  [
    '/tokens',
    '/tokens/:identifier',
    '/accounts/:hash/tokens',
    '/accounts/:hash/tokens/:identifier',
  ],
  async (req, res) => {
    const {
      params: pathParameters = {},
      query: queryStringParameters = {},
      headers: requestHeaders = {},
    } = req;

    await setForwardedHeaders(requestHeaders);

    const { statusCode, headers, body } = await tokensHandler({
      pathParameters,
      queryStringParameters,
    });

    res.status(statusCode).set(headers).json(body);
  }
);

module.exports = router;
