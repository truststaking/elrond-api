const express = require('express');
let router = express.Router();
const { setForwardedHeaders } = require('../handlers/helpers');

router.get('/', async (req, res) => {
  const {
    params: pathParameters = {},
    query: queryStringParameters = {},
    headers: requestHeaders = {},
  } = req;

  await setForwardedHeaders(requestHeaders);

  router.get('/', async (req, res) => {
    res.redirect('https://api-docs.elrond.com');
  });
});
module.exports = router;