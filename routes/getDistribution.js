const express = require('express');
const router = express.Router();
const { getDistributionHandler } = require('../handlers');
const { setForwardedHeaders } = require('../handlers/helpers');

router.get(['/getDistribution'], async (req, res) => {
  const { headers: requestHeaders = {} } = req;

  await setForwardedHeaders(requestHeaders);

  const { statusCode, headers, body } = await getDistributionHandler();

  res.status(statusCode).set(headers).json(body);
});

module.exports = router;
