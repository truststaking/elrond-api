const express = require('express');
const router = express.Router();
const { waitingListHandler } = require('../handlers');

router.get(['/waiting-list', '/accounts/:hash/waiting-list'], async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await waitingListHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
