const express = require('express');
const router = express.Router();
const { identitiesHandler } = require('../handlers');

router.get(['/identities', '/identities/:key'], async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await identitiesHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
