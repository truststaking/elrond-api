const getAddressHistory = require('./getAddressHistory');
const { getTimestampByEpoch, getEpoch, Phase3 } = require('./getEpoch');
const { getEpochTimePrice } = require('./dynamoDB');
const {
  ContractFunction,
  ProxyProvider,
  BytesValue,
  Address,
  SmartContract,
} = require('@elrondnetwork/erdjs');
const BigNumber = require('bignumber.js');
const denominate = require('./denominate');
const getProviderMetadata = require('./getProviders');
const getProfile = require('./getProfile');
const bech32 = require('./bech32');

function DecimalHexTwosComplement(decimal) {
  var size = 8;

  if (decimal >= 0) {
    var hexadecimal = decimal.toString(16);

    while (hexadecimal.length % size != 0) {
      hexadecimal = '' + 0 + hexadecimal;
    }

    return hexadecimal;
  } else {
    hexadecimal = Math.abs(decimal).toString(16);
    while (hexadecimal.length % size != 0) {
      hexadecimal = '' + 0 + hexadecimal;
    }

    var output = '';
    for (let i = 0; i < hexadecimal.length; i++) {
      output += (0x0f - parseInt(hexadecimal[i], 16)).toString(16);
    }

    output = (0x01 + parseInt(output, 16)).toString(16);
    return output;
  }
}

function hexToDec(hex) {
  return hex
    .toLowerCase()
    .split('')
    .reduce((result, ch) => result * 16 + '0123456789abcdefgh'.indexOf(ch), 0);
}

const calculateReward = async (epoch, amount, agency, isOwner) => {
  let provider = new ProxyProvider('https://gateway.elrond.com', 20000);
  let delegationContract = new SmartContract({ address: new Address(agency) });

  if (epoch) {
    let response = await delegationContract.runQuery(provider, {
      func: new ContractFunction('getRewardData'),
      args: [BytesValue.fromHex(DecimalHexTwosComplement(epoch))],
    });
    if (response.returnCode.text === 'ok') {
      let agency_reward = {
        rewardDistributed: new BigNumber(
          hexToDec(Buffer.from(response.returnData[0], 'base64').toString('hex'))
        ).toFixed(),
        totalActiveStake: new BigNumber(
          hexToDec(Buffer.from(response.returnData[1], 'base64').toString('hex'))
        ).toFixed(),
        serviceFee: new BigNumber(
          hexToDec(Buffer.from(response.returnData[2], 'base64').toString('hex'))
        ).toFixed(),
      };
      agency_reward['epoch'] = epoch;
      agency_reward['staked'] = amount;
      let ownerProfit = new BigNumber(agency_reward.serviceFee)
        .dividedBy(10000)
        .multipliedBy(new BigNumber(agency_reward.rewardDistributed));
      agency_reward['ownerProfit'] = denominate({ input: ownerProfit.toFixed() });
      let toBeDistributed = new BigNumber(agency_reward.rewardDistributed).minus(
        new BigNumber(ownerProfit)
      );
      agency_reward['toBeDistributed'] = denominate({ input: toBeDistributed });
      let reward = new BigNumber(toBeDistributed).multipliedBy(
        new BigNumber(agency_reward['staked'])
      );

      reward = new BigNumber(reward).dividedBy(new BigNumber(agency_reward.totalActiveStake));
      if (isOwner) {
        reward = reward.plus(new BigNumber(ownerProfit) / new BigNumber(Math.pow(10, 18)));
      }
      agency_reward['APROwner'] = new BigNumber(agency_reward.rewardDistributed)
        .multipliedBy(36500)
        .dividedBy(new BigNumber(agency_reward.totalActiveStake))
        .toFixed();
      agency_reward['APRDelegator'] = new BigNumber(agency_reward['APROwner'])
        .minus(
          new BigNumber(agency_reward['APROwner']).multipliedBy(
            new BigNumber(agency_reward.serviceFee).dividedBy(10000)
          )
        )
        .toFixed();
      agency_reward['rewardDistributed'] = denominate({ input: agency_reward.rewardDistributed });
      agency_reward['totalActiveStake'] = denominate({ input: agency_reward.totalActiveStake });
      agency_reward['reward'] = denominate({ input: reward, denomination: 6 });
      const timestamp = getTimestampByEpoch(epoch);
      const epochPrice = await getEpochTimePrice(epoch, timestamp);
      agency_reward['usdRewards'] = new BigNumber(epochPrice).multipliedBy(reward).toFixed();
      agency_reward['usdEpoch'] = epochPrice;
      agency_reward['unix'] = timestamp * 1000;
      var date = new Date(getTimestampByEpoch(epoch) * 1000);
      agency_reward['date'] =
        '' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
      return agency_reward;
    } else {
      const timestamp = getTimestampByEpoch(epoch);
      var dateTime = new Date(timestamp * 1000);
      const epochPrice = await getEpochTimePrice(epoch, timestamp);
      return {
        staked: amount,
        reward: 0,
        usdEpoch: epochPrice,
        unix: timestamp * 1000,
        date:
          '' + dateTime.getDate() + '/' + (dateTime.getMonth() + 1) + '/' + dateTime.getFullYear(),
        APRDelegator: 0,
        APROwner: 0,
        epoch,
        ownerProfit: 0,
        rewardDistributed: 0,
        usdRewards: 0,
        serviceFee: 0,
        toBeDistributed: 0,
        totalActiveStake: 0,
      };
    }
  } else {
    console.log('Error');
    return 0;
  }
};

const isOwner = async (agency, address) => {
  let provider = new ProxyProvider('https://gateway.elrond.com', 20000);
  let delegationContract = new SmartContract({ address: new Address(agency) });
  let reply = false;
  let response = await delegationContract.runQuery(provider, {
    func: new ContractFunction('getContractConfig'),
    args: [],
  });
  if (response.returnCode.text === 'ok') {
    reply = bech32.encode(Buffer.from(response.returnData[0], 'base64').toString('hex')) == address;
  } else {
    console.log('Error');
  }
  return reply;
};

const getRewardsHistory = async (query) => {
  if (query.start < Phase3.timestamp) {
    query.start = Phase3.timestamp;
  }

  let inner_query = {
    address: query.address,
    before: query.stop,
  };

  let data = await getAddressHistory(inner_query);
  let fullEpochsStakedAmounts = {};
  let todayEpoch = getEpoch(Math.floor(Date.now() / 1000));
  let lastEpochHistory = {};
  let result = {};
  let providers = {};
  let total = {};
  let totalUSD = {};
  for (let epoch = Phase3.epoch - 15; epoch <= todayEpoch; epoch++) {
    if (epoch in data.epochHistoryStaked) {
      Object.keys(lastEpochHistory).forEach((SC) => {
        if (!fullEpochsStakedAmounts[epoch]) {
          fullEpochsStakedAmounts[epoch] = { staked: {} };
        }
        if (lastEpochHistory[SC] > 0) {
          fullEpochsStakedAmounts[epoch].staked = {
            ...fullEpochsStakedAmounts[epoch].staked,
            [SC]: lastEpochHistory[SC],
          };
        } else {
          delete lastEpochHistory[SC];
        }
      });
      Object.keys(data.epochHistoryStaked[epoch].staked).forEach((agencySC) => {
        lastEpochHistory[agencySC] = data.epochHistoryStaked[epoch].staked[agencySC];
      });
      if (
        epoch > Phase3.epoch &&
        fullEpochsStakedAmounts[epoch] &&
        fullEpochsStakedAmounts[epoch].staked !== undefined
      ) {
        for (let agencySC of Object.keys(fullEpochsStakedAmounts[epoch].staked)) {
          let savedStaked = fullEpochsStakedAmounts[epoch].staked[agencySC];
          if (!providers[agencySC]) {
            providers[agencySC] = await isOwner(agencySC, query.address);
          }
          let agencyInfo = await calculateReward(
            parseInt(epoch),
            savedStaked,
            agencySC,
            providers[agencySC]
          );
          if (!total[agencySC]) {
            total[agencySC] = new BigNumber(agencyInfo['reward']);
          } else {
            total[agencySC] = total[agencySC].plus(new BigNumber(agencyInfo['reward']));
          }

          if (!result[agencySC]) {
            result[agencySC] = [];
          }

          result[agencySC].push({
            ...agencyInfo,
          });
        }
      }
    } else {
      Object.keys(lastEpochHistory).forEach((SC) => {
        if (!fullEpochsStakedAmounts[epoch]) {
          fullEpochsStakedAmounts[epoch] = { staked: {} };
        }

        if (lastEpochHistory[SC] > 0) {
          fullEpochsStakedAmounts[epoch].staked = {
            ...fullEpochsStakedAmounts[epoch].staked,
            [SC]: lastEpochHistory[SC],
          };
        } else {
          delete lastEpochHistory[SC];
        }
      });
      if (
        epoch > Phase3.epoch &&
        fullEpochsStakedAmounts[epoch] &&
        fullEpochsStakedAmounts[epoch].staked !== undefined
      ) {
        for (let agencySC of Object.keys(fullEpochsStakedAmounts[epoch].staked)) {
          let savedStaked = fullEpochsStakedAmounts[epoch].staked[agencySC];
          if (!providers[agencySC]) {
            providers[agencySC] = await isOwner(agencySC, query.address);
          }
          let agencyInfo = await calculateReward(
            parseInt(epoch),
            savedStaked,
            agencySC,
            providers[agencySC]
          );
          if (!total[agencySC]) {
            total[agencySC] = new BigNumber(agencyInfo['reward']);
          } else {
            total[agencySC] = total[agencySC].plus(new BigNumber(agencyInfo['reward']));
          }

          if (!totalUSD[agencySC]) {
            totalUSD[agencySC] = new BigNumber(agencyInfo['usdRewards']);
          } else {
            totalUSD[agencySC] = totalUSD[agencySC].plus(new BigNumber(agencyInfo['usdRewards']));
          }

          if (!result[agencySC]) {
            result[agencySC] = [];
          }

          result[agencySC].push({
            ...agencyInfo,
          });
        }
      }
    }
  }

  let keybaseIDs = {};
  let full_total = new BigNumber(0);
  let fullUSD_total = new BigNumber(0);
  for (let scAddress of Object.keys(total)) {
    full_total = full_total.plus(total[scAddress]);
    fullUSD_total = fullUSD_total.plus(totalUSD[scAddress]);
    total[scAddress] = parseFloat(total[scAddress].toFixed());
    totalUSD[scAddress] = parseFloat(totalUSD[scAddress].toFixed());
    let metadata = await getProviderMetadata(scAddress);
    if (!metadata.idenity) {
      let keybase = await getProfile(metadata['identity']);
      if (keybase.name) {
        keybaseIDs[scAddress] = { ...keybase, ...metadata };
      } else {
        keybaseIDs[scAddress] = scAddress;
      }
    } else {
      keybaseIDs[scAddress] = scAddress;
    }
  }
  const toReturn = {
    rewards_per_epoch: result,
    keybase: keybaseIDs,
    total_per_provider: total,
    totalUSD_per_provider: totalUSD,
    total: parseFloat(full_total.toFixed()),
  };
  return toReturn;
};

module.exports = getRewardsHistory;
