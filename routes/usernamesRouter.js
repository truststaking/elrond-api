const express = require('express');
const router = express.Router();
// const { usernamesHandler } = require('../handlers');

router.get('/usernames', async (req, res) => {
  // const { params: pathParameters = {}, query: queryStringParameters = {} } = req;

  // const { statusCode, headers, body } = await usernamesHandler({
  //   pathParameters,
  //   queryStringParameters,
  // });

  res.status(301).redirect('https://api.elrond.com/usernames');
});

module.exports = router;
