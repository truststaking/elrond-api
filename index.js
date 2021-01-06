const express = require('express');
const app = express();
const port = 3000;

const routes = require('./routes');

app.use(Object.values(routes));

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
