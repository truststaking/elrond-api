const express = require('express');
const router = express.Router();
const { usernamesHandler } = require('../handlers');

router.get('/usernames/:username', async (req, res) => {
  const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  const { statusCode, headers, body } = await usernamesHandler({
    pathParameters,
    queryStringParameters,
  });

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
