const express = require('express');
const router = express.Router();
const { accountsHandler } = require('../handlers');

router.get(['/accounts', '/accounts/:hash'], async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await accountsHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
