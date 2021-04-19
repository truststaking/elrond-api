require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const { statuses } = require(`./handlers/configs/${process.env.CONFIG}`);
const { prewarmHandler } = require('./handlers');

const app = express();
const port = 8000;

app.use(bodyParser.json());

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: statuses[400] });
  } else {
    next();
  }
});

const routes = require('./routes');

app.use(Object.values(routes));

app.use((req, res) => {
  res.status(405).json({ error: statuses[405] });
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
  setInterval(prewarmHandler, 60000);
});
