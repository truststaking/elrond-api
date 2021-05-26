const express = require('express');
const promBundle = require('express-prom-bundle');

const metricsRequestMiddleware = promBundle({
  includePath: true,
  includeMethod: true,
  autoregister: false, // Do not register /metrics
  promClient: {
    collectDefaultMetrics: {},
  },
});
const { promClient, metricsMiddleware } = metricsRequestMiddleware;
// promClient here is the prom-client object

// Metrics app to expose /metrics endpoint
const metricsApp = express();
metricsApp.use(metricsMiddleware);

const metricsPort = 9090;

module.exports = { metricsRequestMiddleware, metricsApp, metricsPort };
