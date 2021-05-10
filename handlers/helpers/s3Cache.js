const AWS = require('aws-sdk');

const { cacheTtl } = require(`../configs/${process.env.CONFIG}`);

const s3 = new AWS.S3();
const Bucket = process.env.BUCKET;

const putCache = async ({ key, value, ttl = cacheTtl }) => {
  if (process.env.LOCAL && process.env.LOCAL === 'true') {
    return;
  }

  const params = {
    Bucket,
    Key: `cache/${key}.json`,
    Body: JSON.stringify({
      value,
      created: Math.floor(Date.now() / 1000),
      expires: Math.floor(Date.now() / 1000) + ttl,
    }),
  };

  await s3.putObject(params).promise();
};

const getCache = async ({ key }) => {
  if (process.env.LOCAL && process.env.LOCAL === 'true') {
    return false;
  }

  try {
    const params = {
      Bucket,
      Key: `cache/${key}.json`,
    };

    const { Body } = await s3.getObject(params).promise();

    const { value, expires } = JSON.parse(Body.toString());
    const now = Math.floor(Date.now() / 1000);

    if (value && expires >= now) {
      return value;
    }
    // eslint-disable-next-line no-empty
  } catch (error) {}

  return false;
};

module.exports = {
  putCache,
  getCache,
};
