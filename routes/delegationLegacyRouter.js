const express = require('express');
const router = express.Router();
const { delegationLegacyHandler } = require('../handlers');

router.get(['/delegation-legacy', '/accounts/:hash/delegation-legacy'], async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await delegationLegacyHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
