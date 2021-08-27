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
    let todayEpoch = getEpoch(Math.floor(Date.now() / 1000));
    const metaDataPromises = [];
    for (let SC of data) {
      metaDataPromises.push(getProviderMetadata(SC));
      let params = {
        TableName: 'avg_apy',
        Index: 'owner',
        KeyConditionExpression: 'provider = :SC AND epoch = :EP',
        ExpressionAttributeValues: {
          ':SC': { S: SC },
          ':EP': { N: `${todayEpoch}` },
        },
      };
      const result = await db.send(new QueryCommand(params));
      accumulated = [...accumulated, ...result.Items];
    }
    const getProfileResponses = [];
    const metaDataResponse = await Promise.all(metaDataPromises);
    for (let response of metaDataResponse) {
      getProfileResponses.push(getProfile(response['identity'], response['address']));
    }
    const keybaseReponses = await Promise.all(getProfileResponses);
    for (let SC of data) {
      keybaseIDs[SC] = keybaseReponses.filter((item) => item.address === SC)[0];
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
        name: keybaseIDs[data.provider] ? keybaseIDs[data.provider].name : data.provider,
        ...data,
        date: new Date(getTimestampByEpoch(parseInt(data.epoch)) * 1000).toLocaleDateString(),
      };
    });
    const graphData = Object.keys(array).map((value) => {
      return array[value];
    });
    return { data: graphData };
  } catch (err) {
    console.log('Error', err);
  }
};

const getDistribution = async () => {
  const data = await availableProviders();
  try {
    let array = {};
    let keybaseIDs = [];
    let accumulated = [];
    let todayEpoch = getEpoch(Math.floor(Date.now() / 1000));
    const metaDataPromises = [];
    for (let SC of data) {
      metaDataPromises.push(getProviderMetadata(SC));
      let params = {
        TableName: 'agencies_distribution',
        Index: 'provider-index',
        KeyConditionExpression: 'provider = :SC AND epoch = :EP',
        ExpressionAttributeValues: {
          ':SC': { S: SC },
          ':EP': { N: `${todayEpoch - 1}` },
        },
      };
      const result = await db.send(new QueryCommand(params));
      accumulated = [...accumulated, ...result.Items];
    }
    const getProfileResponses = [];
    const metaDataResponse = await Promise.all(metaDataPromises);
    for (let response of metaDataResponse) {
      getProfileResponses.push(getProfile(response['identity'], response['address']));
    }
    const keybaseReponses = await Promise.all(getProfileResponses);
    for (let SC of data) {
      keybaseIDs[SC] = keybaseReponses.filter((item) => item.address === SC)[0];
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
        name: keybaseIDs[data.provider]['name'],
        ...data,
        date: new Date(getTimestampByEpoch(parseInt(data.epoch)) * 1000).toLocaleDateString(),
      };
    });
    const graphData = Object.keys(array).map((value) => {
      return array[value];
    });
    return { data: graphData };
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

module.exports = { getAVGAPY, getEpochTimePrice, getDistribution };
