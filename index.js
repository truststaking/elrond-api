const express = require('express');
const app = express();
const port = 3000;

const redis = require('redis');
const client = redis.createClient();

client.on('error', (error) => {
  console.error(error);
});
client.set('key', 'value', redis.print);
client.get('key', redis.print);

const { elasticSearchRouter } = require('./routes');

app.use(elasticSearchRouter);

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
