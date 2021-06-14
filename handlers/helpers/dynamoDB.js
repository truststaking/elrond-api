const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { availableProviders } = require('./availableContracts');
const getProviderMetadata = require('./getProviders');
const { getTimestampByEpoch, getEpoch } = require('./getEpoch');
const getProfile = require('./getProfile');
const db = new DynamoDBClient({ region: 'eu-west-1' });

const getAVGAPY = async () => {
  const data = await availableProviders();
  try {
    let array = {};
    let keybaseIDs = [];
    let accumulated = [];
    for (let SC of data) {
      let metadata = await getProviderMetadata(SC);
      if (!metadata.idenity) {
        let keybase = await getProfile(metadata['identity']);
        if (keybase.name) {
          keybaseIDs[SC] = keybase.name;
        } else {
          keybaseIDs[SC] = SC;
        }
      } else {
        keybaseIDs[SC] = SC;
      }
      let todayEpoch = getEpoch(Math.floor(Date.now() / 1000));
      let result;
      let params = {
        TableName: 'avg_apy',
        Index: 'owner',
        KeyConditionExpression: 'provider = :SC AND epoch = :EP',
        ExpressionAttributeValues: {
          ':SC': { S: SC },
          ':EP': { N: `${todayEpoch}` },
        },
      };
      result = await db.send(new QueryCommand(params));
      console.log(result.Items);
      accumulated = [...accumulated, ...result.Items];
    }
    accumulated.forEach((data) => {
      let tmpData = data;
      Object.keys(data).forEach((fieldName) => {
        Object.keys(data[fieldName]).forEach((fieldType) => {
          tmpData[fieldName] = data[fieldName][fieldType];
          if (fieldName === 'epoch') {
            tmpData['timestamp'] = getTimestampByEpoch(parseInt(data[fieldName]));
          }
        });
      });
      if (!array[data.provider]) {
        array[data.provider] = [];
      }
      array[data.provider] = {
        ...array[data.provider],
        [keybaseIDs[data.provider]]: parseFloat(data.avg_apy),
        date: new Date(getTimestampByEpoch(parseInt(data.epoch)) * 1000).toLocaleDateString(),
      };
    });
    const graphData = Object.keys(array).map((value) => {
      return array[value];
    });
    return { SCs: Object.keys(keybaseIDs).map((SC) => keybaseIDs[SC]), data: graphData };
  } catch (err) {
    console.log('Error', err);
  }
};

const getEpochTimePrice = async (epoch, time) => {
  const timeB = time - 50;
  const timeG = time + 50;
  let params = {
    TableName: 'EGLDUSD',
    Index: 'price',
    KeyConditionExpression: 'epoch = :ep AND #time BETWEEN :timB AND :timG',
    ExpressionAttributeNames: {
      '#time': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':ep': { N: epoch.toString() },
      ':timB': { N: `${timeB}` },
      ':timG': { N: `${timeG}` },
    },
    Limit: 1,
  };
  let result = await db.send(new QueryCommand(params));
  let price = '0';
  try {
    price = result.Items[0].price.S;
  } catch (error) {
    let params = {
      TableName: 'EGLDUSD',
      Index: 'price',
      KeyConditionExpression: 'epoch = :ep AND #time BETWEEN :timB AND :timG',
      ExpressionAttributeNames: {
        '#time': 'timestamp',
      },
      ExpressionAttributeValues: {
        ':ep': { N: (epoch - 1).toString() },
        ':timB': { N: `${timeB}` },
        ':timG': { N: `${timeG}` },
      },
      Limit: 1,
    };
    let result = await db.send(new QueryCommand(params));
    try {
      price = result.Items[0].price.S;
    } catch (error) {
      let params = {
        TableName: 'EGLDUSD',
        Index: 'price',
        KeyConditionExpression: 'epoch = :ep AND #time BETWEEN :timB AND :timG',
        ExpressionAttributeNames: {
          '#time': 'timestamp',
        },
        ExpressionAttributeValues: {
          ':ep': { N: (epoch + 1).toString() },
          ':timB': { N: `${timeB}` },
          ':timG': { N: `${timeG}` },
        },
        Limit: 1,
      };
      let result = await db.send(new QueryCommand(params));
      try {
        price = result.Items[0].price.S;
      } catch (error) {
        console.log(epoch);
        console.log('Start', timeB, ' End: ', timeG, ' Time: ', time);
      }
    }
    // console.log(result);
  }
  return price;
};

module.exports = { getAVGAPY, getEpochTimePrice };
