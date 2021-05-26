const express = require('express');
const router = express.Router();
const { blocksHandler } = require('../handlers');

router.get(['/blocks', '/blocks/:hash'], async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await blocksHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
