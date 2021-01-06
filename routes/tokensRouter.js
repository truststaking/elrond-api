const express = require('express');
const router = express.Router();
const { tokensHandler } = require('../handlers');

const paths = ['/tokens', '/tokens/:identifier', '/accounts/:hash/tokens'];

router.get(paths, async (req, res) => {
  const { params: pathParameters } = req;

  const { statusCode, headers, body } = await tokensHandler({ pathParameters });

  res.status(statusCode).set(headers).send(body);
});

module.exports = router;
