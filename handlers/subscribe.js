const crypto = require('crypto');
const AWS = require('aws-sdk');
const { axios, setForwardedHeaders } = require('./helpers');
const moment = require('moment');
const yup = require('yup');
const fs = require('fs');

const { recaptchaSecret } = require(`./configs/${process.env.CONFIG}`);

const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.TABLE;

const { response, sendgrid } = require('./helpers');

const putVerification = async ({ verification, email }) => {
  const date = moment();
  const expires = moment().add(3, 'd');

  const params = {
    TableName,
    Item: {
      pk: verification,
      sk: '#VERIFICATION',
      email: email,
      created: date.unix(),
      expires: expires.unix(),
    },
    ConditionExpression: 'attribute_not_exists(pk)',
  };

  await dynamo.put(params).promise();
};

const getVerificationDetails = async ({ verification }) => {
  const params = {
    TableName,
    Key: {
      pk: verification,
      sk: '#VERIFICATION',
    },
    ConsistentRead: true,
  };

  const { Item } = await dynamo.get(params).promise();

  if (Item) {
    const { pk, email } = Item;
    return { savedVerification: pk, savedEmail: email };
  }

  return false;
};

const template = ({ link }) => {
  let html = fs.readFileSync('assets/subscribe.html', 'utf8');

  if (link) {
    html = html.replace(/%LINK%/gi, link);
  }

  return html;
};

const generateCode = () => {
  const now = Date.now();
  const random = Math.random();

  return crypto.createHash('md5').update(`${now}${random}`).digest('hex');
};

const registerSchema = yup.object().shape({
  email: yup
    .string('Invalid Email')
    .email('Invalid Email')
    .test('email', 'Invalid Email', async (value) => {
      let response = true;
      await axios({
        method: 'get',
        url: `https://disposable.debounce.io/?email=${value}`,
        timeout: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((data) => {
          const {
            data: { disposable },
          } = data;
          response = disposable.toLowerCase() === 'true' ? false : true;
        })
        .catch(() => {
          response = true;
        });

      return response;
    })
    .required(),
  recaptcha: yup
    .string('Invalid Recaptcha')
    .test('recaptcha', 'Invalid Recaptcha', async (value) => {
      let response = false;
      await axios({
        method: 'post',
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${value}`,
      })
        .then((data) => {
          const {
            data: { success },
          } = data;
          if (success) {
            response = true;
          }
        })
        .catch(() => {
          response = false;
        });

      return response;
    })
    .required(),
});

const confirmSchema = yup.object().shape({
  verification: yup.string('Invalid Verification Code').required(),
});

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  body,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });
  // TODO: limit body size

  try {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (error) {
      return response({ status: 422 });
    }

    const { email, verification } = parsed;

    if (verification) {
      try {
        await confirmSchema.validate(parsed);
      } catch (error) {
        return response({ status: 422, data: { error: error.message } });
      }

      try {
        const { savedEmail } = await getVerificationDetails({ verification });
        try {
          await sendgrid.subscribe({ email: savedEmail });
          return response({ status: 201 });
        } catch (error) {
          return response({
            status: 400,
            data: { error: `Error while subscribing the email. Please try again.` },
          });
        }
      } catch (error) {
        return response({
          status: 400,
          data: { error: 'Invalid or expired verification code' },
        });
      }
    } else {
      try {
        await registerSchema.validate(parsed);
      } catch (error) {
        return response({ status: 422, data: { error: error.message } });
      }

      const verification = generateCode();

      try {
        await putVerification({ verification, email });
      } catch (error) {
        return response({
          status: 400,
          data: { error: 'An error occured. Please try again.' },
        });
      }

      try {
        const html = template({
          link: `https://elrond.com/confirm/?verification=${verification}`,
        });
        await sendgrid.send({
          to: email,
          subject: 'Confirm your email address',
          html,
        });
      } catch (error) {
        return response({
          status: 400,
          data: { error: 'An error occured. Please try again.' },
        });
      }

      return response({ status: 201 });
    }
  } catch (error) {
    return response({ status: 500 });
  }
};
