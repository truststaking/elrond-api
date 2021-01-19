const express = require('express');
const router = express.Router();
const { miniblocksHandler } = require('../handlers');

const paths = ['/miniblocks', '/miniblocks/:hash'];

router.get(paths, async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await miniblocksHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
