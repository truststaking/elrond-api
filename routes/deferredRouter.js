const express = require('express');
const router = express.Router();
const { deferredHandler } = require('../handlers');

router.get('/accounts/:hash/deferred', async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await deferredHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
