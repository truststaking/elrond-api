require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { metricsApp, metricsRequestMiddleware, metricsPort } = require('./metrics');
const { statuses } = require(`./handlers/configs/${process.env.CONFIG}`);
const { prewarmHandler } = require('./handlers');

const app = express();
const port = 8000;

app.use(metricsRequestMiddleware);

app.use(
  cors({
    origin: '*',
    headers: '*',
    methods: '*',
  })
);
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

const server = app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);

  if (process.env.CHRONO) {
    setInterval(prewarmHandler, 60000);
  }
});

server.keepAliveTimeout = 61 * 1000; //61s
server.headersTimeout = 65 * 1000; //65s `keepAliveTimeout + server's expected response time`

metricsApp.listen(metricsPort);
