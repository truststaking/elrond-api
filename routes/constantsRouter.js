const express = require('express');
const router = express.Router();
const { constantsHandler } = require('../handlers');

router.get('/constants', async (req, res) => {
  const { statusCode, headers, body } = await constantsHandler();

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
