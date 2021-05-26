const express = require('express');
const router = express.Router();
const { unbondPeriodHandler } = require('../handlers');

router.get('/keys/:key/unbond-period', async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await unbondPeriodHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
