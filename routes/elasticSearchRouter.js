const express = require('express');
const router = express.Router();
const { elasticSearchHandler } = require('../handlers');

const paths = [
  '/blocks',
  '/blocks/:hash',
  '/miniblocks',
  '/miniblocks/:miniBlockHash',
  '/accounts',
  '/accounts/:address',
  '/transactions',
  '/transactions/:txHash',
];

router.get(paths, async (req, res) => {
  const { originalUrl: path, query: queryStringParameters } = req;

  const { statusCode, headers, body } = await elasticSearchHandler({ path, queryStringParameters });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
