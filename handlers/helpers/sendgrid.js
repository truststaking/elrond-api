const sendgridMail = require('@sendgrid/mail');
const https = require('https');
const { htmlToText } = require('html-to-text');

const { sendgridApiKey, sendgridFrom } = require(`../configs/${process.env.CONFIG}`);

sendgridMail.setApiKey(sendgridApiKey);

const send = async ({ to, subject, text = '', html = '' }) => {
  const email = {
    from: sendgridFrom,
    to,
    subject,
  };

  if (html) {
    email.text = htmlToText(html);
    email.html = html;
  } else {
    email.text = text;
  }

  await sendgridMail.send(email);
};

const subscribe = async ({ email }) => {
  const data = JSON.stringify([
    {
      email,
    },
  ]);

  const options = {
    method: 'POST',
    hostname: 'api.sendgrid.com',
    path: '/v3/contactdb/recipients',
    headers: {
      authorization: `Bearer ${sendgridApiKey}`,
      'content-type': 'application/json',
    },
  };

  let promise = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });

  return await promise;
};

module.exports = {
  send,
  subscribe,
};
