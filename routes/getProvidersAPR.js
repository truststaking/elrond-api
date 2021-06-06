const express = require('express');
const router = express.Router();
const { getProvidersAPRHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get(['/getAPRAVG'], async (req, res) => {
  const { headers: requestHeaders = {} } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await getProvidersAPRHandler();

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
