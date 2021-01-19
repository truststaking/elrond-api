const express = require('express');
const router = express.Router();
const { transactionsHandler } = require('../handlers');

const paths = ['/transactions', '/transactions/:hash'];

router.get(paths, async (req, res) => {
  const { originalUrl: path, params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await transactionsHandler({
    path,
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
