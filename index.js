require('dotenv').config();
const express = require('express');
var http = require('http');
var https = require('https');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const { metricsApp, metricsRequestMiddleware, metricsPort } = require('./metrics');
const { statuses } = require(`./handlers/configs/${process.env.CONFIG}`);
const { prewarmHandler } = require('./handlers');

var privateKey = fs.readFileSync('/home/ubuntu/server.key', 'utf8');
var certificate = fs.readFileSync('/home/ubuntu/server.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };
const app = express();
const port = 8000;

app.use(metricsRequestMiddleware);

app.use(bodyParser.json());

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

const metricsServer = metricsApp.listen(metricsPort);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(port);
httpsServer.listen(8443);
