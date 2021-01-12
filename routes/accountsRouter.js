const express = require('express');
const router = express.Router();
const { accountsHandler } = require('../handlers');

const paths = ['/accounts-new', '/accounts-new/:hash'];

router.get(paths, async (req, res) => {
  const { originalUrl: path, params: pathParameters, query: queryStringParameters } = req;

  const { statusCode, headers, body } = await accountsHandler({
    path,
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
