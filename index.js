const express = require('express');
const app = express();
const port = 3000;

const { elasticSearchRouter } = require('./routes');

app.use(elasticSearchRouter);

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
