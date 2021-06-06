const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { availableProviders } = require('./availableContracts');
const getProviderMetadata = require('./getProviders');
const { getTimestampByEpoch } = require('./getEpoch');
const getProfile = require('./getProfile');
const db = new DynamoDBClient({ region: 'eu-west-1' });

const getAVGAPY = async () => {
  const data = await availableProviders();
  try {
    let array = {};
    let keybaseIDs = [];
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
      let ExclusiveStartKey,
        accumulated = [],
        result;
      do {
        let params = {
          TableName: 'avg_apy',
          Index: 'owner',
          ExclusiveStartKey,
          KeyConditionExpression: 'provider = :SC',
          ExpressionAttributeValues: {
            ':SC': { S: SC },
          },
        };
        result = await db.send(new QueryCommand(params));
        ExclusiveStartKey = result.LastEvaluatedKey;
        accumulated = [...accumulated, ...result.Items];
      } while (result.LastEvaluatedKey);
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
        if (!array[data.epoch]) {
          array[data.epoch] = [];
        }
        array[data.epoch] = {
          ...array[data.epoch],
          [keybaseIDs[SC]]: parseFloat(data.avg_apy),
          name: new Date(getTimestampByEpoch(parseInt(data.epoch)) * 1000).toLocaleDateString(),
        };
      });
    }
    const graphData = Object.keys(array).map((value) => {
      return array[value];
    });
    return { SCs: Object.keys(keybaseIDs).map((SC) => keybaseIDs[SC]), data: graphData };
  } catch (err) {
    console.log('Error', err);
  }
};

module.exports = { getAVGAPY };
