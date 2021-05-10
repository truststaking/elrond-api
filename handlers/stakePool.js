const crypto = require('crypto');
const AWS = require('aws-sdk');
const { axios, setForwardedHeaders } = require('./helpers');
const yup = require('yup');

const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.TABLE;

const { elasticUrl } = require(`./configs/${process.env.CONFIG}`);
const { bech32, response } = require('./helpers');

const putEthereumAddress = async ({ ethereumAddress, address, ip }) => {
  const params = {
    TableName,
    Item: {
      pk: ethereumAddress,
      sk: '#ETHEREUM',
      address,
      ip,
      created: Math.floor(Date.now() / 1000),
    },
    ConditionExpression: 'attribute_not_exists(pk)',
  };

  await dynamo.put(params).promise();
};

const putPoolStake = async ({ address, ethereumAddress, token, ip }) => {
  const params = {
    TableName,
    Item: {
      pk: address,
      sk: '#POOL',
      ethereumAddress,
      token,
      ip,
      created: Math.floor(Date.now() / 1000),
    },
    ConditionExpression: 'attribute_not_exists(pk)',
  };

  await dynamo.put(params).promise();
};

const getPoolStake = async ({ address }) => {
  const params = {
    TableName,
    Key: {
      pk: address,
      sk: '#POOL',
    },
    ConsistentRead: true,
  };

  const { Item } = await dynamo.get(params).promise();

  if (Item) {
    const { token, ethereumAddress } = Item;
    return { token, ethereumAddress };
  }

  return false;
};

const getCampaign = async () => {
  const params = {
    TableName,
    Key: {
      pk: 'POOL',
      sk: 'STAKE',
    },
    ConsistentRead: true,
  };

  const { Item } = await dynamo.get(params).promise();

  if (Item) {
    // eslint-disable-next-line no-unused-vars
    const { pk, sk, ...rest } = Item;
    return rest;
  }

  return false;
};

const deleteEthereumAddress = async ({ ethereumAddress }) => {
  const params = {
    TableName,
    Key: {
      pk: ethereumAddress,
      sk: '#ETHEREUM',
    },
  };

  await dynamo.delete(params).promise();
};

const getCount = async ({ sender, receiver, value }) => {
  const url = `${elasticUrl()}/transactions/_count`;

  let must;
  if (sender !== undefined) {
    must = [{ match: { receiver } }, { match: { sender } }, { match: { value } }];
  } else {
    must = [{ match: { receiver } }, { match: { value } }];
  }

  const {
    data: { count },
  } = await axios.post(url, {
    query: {
      bool: { must },
    },
  });

  return count;
};

const generateToken = () => {
  const now = Date.now();
  const random = Math.random();
  return crypto.createHash('md5').update(`${now}${random}`).digest('hex');
};

const schema = yup.object().shape({
  address: yup
    .string()
    .matches(/erd1+/)
    .length(62)
    .test('bech32', '', (address) => {
      try {
        return !!bech32.decode(address);
      } catch (error) {
        return false;
      }
    })
    .required(),
  ethereumAddress: yup
    .string()
    .length(42)
    .test('format', '', (address) => !!address.toLowerCase().match(/^0x[0-9a-f]+$/i))
    .required(),
  recaptcha: yup.string(),
});

exports.handler = async ({
  requestContext: {
    identity: { userAgent = undefined, caller = undefined, sourceIp: ip } = {},
  } = {},
  pathParameters,
  httpMethod,
  body,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });
  try {
    let address;

    if (pathParameters && pathParameters.hash) {
      address = pathParameters.hash;
    }

    const campaign = await getCampaign();

    if (address) {
      let data = await getPoolStake({ address });

      if (!data) {
        return response({ status: 404 });
      }

      const count = await getCount({
        sender: address,
        receiver: campaign.address,
        value: campaign.value,
      });
      const completed = !!count;

      return response({ data: { ...data, completed } });
    } else {
      if (httpMethod.toLowerCase() == 'get') {
        const count = await getCount({ receiver: campaign.address, value: campaign.value });

        const now = Math.floor(Date.now() / 1000);

        let pool = 'soon';

        if (now >= campaign.start && now < campaign.end) {
          pool = 'active';
        }

        if (count >= campaign.cap) {
          pool = 'filled';
        }

        return response({
          data: { pool, count, ...campaign },
        });
      } else {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch (error) {
          return response({ status: 400 });
        }

        try {
          await schema.validate(parsed);
        } catch (error) {
          return response({ status: 422, data: { error: error.path } });
        }

        const { address, ethereumAddress, recaptcha } = parsed;

        const {
          data: { success },
        } = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=6Ldze94ZAAAAAE-mA93eLjr9Q43r9VGdDuk5NdOO&response=${recaptcha}&remoteip=${ip}`
        );

        if (!success) {
          console.error('invalid recaptcha');
          return response({ status: 400 });
        }

        const count = await getCount({ receiver: campaign.address, value: campaign.value });

        if (count >= campaign.cap) {
          return response({ status: 409, data: { error: 'filled' } });
        }

        try {
          await putEthereumAddress({ ethereumAddress, address, ip });
        } catch (error) {
          return response({ status: 409, data: { error: 'ethereumAddress' } });
        }

        const token = generateToken();

        try {
          await putPoolStake({ address, ethereumAddress, token, ip });
        } catch (error) {
          await deleteEthereumAddress({ ethereumAddress });

          return response({ status: 409, data: { error: 'address' } });
        }

        return response({ status: 201, data: { token } });
      }
    }
  } catch (error) {
    console.error('error', error);
    return response({ status: 500 });
  }
};
