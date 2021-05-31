const AWS = require('aws-sdk');
const { axios } = require('./helpers');

const { apiUrl, slackHookUrl } = require(`./configs/${process.env.CONFIG}`);

const s3 = new AWS.S3();
const Bucket = process.env.BUCKET;

exports.handler = async () => {
  try {
    const { data } = await axios({
      method: 'get',
      url: `${apiUrl}/waiting-list`,
    });

    const now = Math.floor(Date.now() / 1000);

    const params = {
      Bucket,
      Key: `snapshots/${now}.json`,
      Body: JSON.stringify(data),
    };

    await s3.putObject(params).promise();

    if (slackHookUrl) {
      try {
        await axios({
          method: 'post',
          url: slackHookUrl,
          data: { text: `snapshot ran ${now}` },
          timeout: 1000,
        });
      } catch (error) {
        console.error('slack webhook error', error);
      }
    }

    return true;
  } catch (error) {
    console.log('snapshot error', error);
    return false;
  }
};
