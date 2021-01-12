const express = require('express');
const router = express.Router();
const { nodesHandler } = require('../handlers');

const paths = ['/nodes', '/nodes/:hash'];

router.get(paths, async (req, res) => {
  const { params: pathParameters, query: queryStringParameters } = req;

  const { statusCode, headers, body } = await nodesHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
