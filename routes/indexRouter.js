const express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
  res.redirect('https://api-docs.elrond.com');
});

module.exports = router;
