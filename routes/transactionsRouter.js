const express = require('express');
const router = express.Router();
const { transactionsHandler, transactionsCreateHandler } = require('../handlers');

router.get(['/transactions', '/transactions/:hash'], async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await transactionsHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

router.post('/transactions', async (req, res) => {
  const { body: payload } = req;

  const { statusCode, headers, body } = await transactionsCreateHandler({
    body: JSON.stringify(payload),
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
