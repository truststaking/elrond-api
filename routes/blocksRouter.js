const express = require('express');
const router = express.Router();
const { blocksHandler } = require('../handlers');

const paths = ['/blocks', '/blocks/:hash'];

router.get(paths, async (req, res) => {
  const { originalUrl: path, params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await blocksHandler({
    path,
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
