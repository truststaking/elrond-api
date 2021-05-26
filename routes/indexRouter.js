const express = require('express');
let router = express.Router();

router.get('/', async (req, res) => {
  res.redirect('https://api-docs.elrond.com');
});

module.exports = router;
