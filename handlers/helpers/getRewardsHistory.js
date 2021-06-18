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

var epochPrice = {};

const calculateReward = async (epoch, amount, agency, isOwner) => {
  let provider = new ProxyProvider('https://api.elrond.com', 20000);
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
      let pricePerEpoch = 0;
      const timestamp = getTimestampByEpoch(epoch);
      if (epoch in epochPrice) {
        pricePerEpoch = epochPrice[epoch];
      } else {
        pricePerEpoch = await getEpochTimePrice(epoch, timestamp);
        epochPrice[epoch] = pricePerEpoch;
      }
      agency_reward['usdRewards'] = parseFloat(
        new BigNumber(pricePerEpoch).multipliedBy(reward).toFixed()
      ).toFixed(2);
      agency_reward['usdEpoch'] = pricePerEpoch;
      agency_reward['unix'] = timestamp * 1000;
      var date = new Date(getTimestampByEpoch(epoch) * 1000);
      agency_reward['date'] =
        '' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
      return agency_reward;
    } else {
      const timestamp = getTimestampByEpoch(epoch);
      var dateTime = new Date(timestamp * 1000);
      let pricePerEpoch = 0;
      if (epoch in epochPrice) {
        pricePerEpoch = epochPrice[epoch];
      } else {
        pricePerEpoch = await getEpochTimePrice(epoch, timestamp);
        epochPrice[epoch] = pricePerEpoch;
      }
      return {
        staked: amount,
        reward: 0,
        usdEpoch: pricePerEpoch,
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
  let avgPriceReward = {};
  let avgRewardDaily = {};
  let avgAPR = {};
  let avgEGLD = {};

  const calculateRewardPerSC = async (agencySC, epoch) => {
    let savedStaked = fullEpochsStakedAmounts[epoch].staked[agencySC];
    let agencyInfo = await calculateReward(
      parseInt(epoch),
      savedStaked,
      agencySC,
      providers[agencySC] | false
    );
    if (!total[agencySC]) {
      total[agencySC] = new BigNumber(agencyInfo['reward']);
    } else {
      total[agencySC] = total[agencySC].plus(new BigNumber(agencyInfo['reward']));
    }

    if (!totalUSD[agencySC]) {
      totalUSD[agencySC] = new BigNumber(agencyInfo['usdRewards']);
      avgPriceReward[agencySC] = new BigNumber(agencyInfo['usdEpoch']);
      avgAPR[agencySC] = new BigNumber(agencyInfo['APRDelegator']);
      avgEGLD[agencySC] = new BigNumber(agencyInfo['reward']);
    } else {
      totalUSD[agencySC] = totalUSD[agencySC].plus(new BigNumber(agencyInfo['usdRewards']));
      avgAPR[agencySC] = avgAPR[agencySC].plus(new BigNumber(agencyInfo['APRDelegator']));
      avgPriceReward[agencySC] = avgPriceReward[agencySC].plus(
        new BigNumber(agencyInfo['usdEpoch'])
      );
      avgEGLD[agencySC] = avgEGLD[agencySC].plus(new BigNumber(agencyInfo['reward']));
    }

    if (!result[agencySC]) {
      result[agencySC] = [];
    }

    result[agencySC].push({
      ...agencyInfo,
    });
  };
  for (let agencySC of Object.keys(data.staked)) {
    if (!providers[agencySC]) {
      providers[agencySC] = await isOwner(agencySC, query.address);
    }
  }
  const promisesEpoch = [];
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
          promisesEpoch.push(calculateRewardPerSC(agencySC, epoch));
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
          promisesEpoch.push(calculateRewardPerSC(agencySC, epoch));
        }
      }
    }
  }

  await Promise.all(promisesEpoch);

  const metaDataPromises = [];
  let keybaseIDs = {};
  let full_total = new BigNumber(0);
  let fullUSD_total = new BigNumber(0);
  for (let scAddress of Object.keys(total)) {
    full_total = full_total.plus(total[scAddress]);
    fullUSD_total = fullUSD_total.plus(totalUSD[scAddress]);
    total[scAddress] = parseFloat(total[scAddress].toFixed());
    avgPriceReward[scAddress] = avgPriceReward[scAddress] / result[scAddress].length;
    avgRewardDaily[scAddress] = totalUSD[scAddress] / result[scAddress].length;
    avgAPR[scAddress] = avgAPR[scAddress] / result[scAddress].length;
    avgEGLD[scAddress] = parseFloat(avgEGLD[scAddress] / result[scAddress].length).toFixed(4);
    totalUSD[scAddress] = parseFloat(totalUSD[scAddress].toFixed());
    metaDataPromises.push(getProviderMetadata(scAddress));
  }
  const getProfileResponses = [];
  const metaDataResponse = await Promise.all(metaDataPromises);
  for (let response of metaDataResponse) {
    getProfileResponses.push(getProfile(response['identity']));
  }
  const keybaseReponses = await Promise.all(getProfileResponses);
  Object.keys(total).forEach((SC, index) => {
    console.log(SC);
    keybaseIDs[SC] = keybaseReponses[index];
  });
  const toReturn = {
    rewards_per_epoch: result,
    keybase: keybaseIDs,
    total_per_provider: total,
    avgPrice_per_provider: avgPriceReward,
    avgAPR_per_provider: avgAPR,
    avgEGLD_per_provider: avgEGLD,
    avgUSDProvider: avgRewardDaily,
    totalUSD_per_provider: totalUSD,
    activeStaked: data.staked,
    total: parseFloat(full_total.toFixed()),
    totalUSD: parseFloat(fullUSD_total.toFixed()),
  };
  return toReturn;
};

module.exports = getRewardsHistory;
