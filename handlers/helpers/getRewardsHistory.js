const getAddressHistory = require('./getAddressHistory');
const {
  ContractFunction,
  ProxyProvider,
  BytesValue,
  Address,
  SmartContract,
} = require('@elrondnetwork/erdjs');
const BigNumber = require('bignumber.js');
const denominate = require('./denominate');
const bech32 = require('./bech32');
const Phase3 = {
  timestamp: 1617633000,
  epoch: 249,
};

const mainnet_proxy = new ProxyProvider('https://gateway.elrond.com');

const getEpoch = (timestamp) => {
  var diff;
  if (timestamp >= Phase3.timestamp) {
    diff = timestamp - Phase3.timestamp;
    return Phase3.epoch + Math.floor(diff / (60 * 60 * 24));
  } else {
    diff = Phase3.timestamp - timestamp;
    return Phase3.epoch - Math.floor(diff / (60 * 60 * 24));
  }
};

const getTimestampByEpoch = (epoch) => {
  var diff;
  if (epoch >= Phase3.epoch) {
    diff = epoch - Phase3.epoch;
    return diff * (60 * 60 * 24) + Phase3.timestamp;
  } else {
    diff = Phase3.epoch - epoch;
    return Phase3.timestamp - diff * (60 * 60 * 24);
  }
};

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
      // eslint-disable-next-line no-undef
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
      agency_reward['reward'] = reward.toFixed();
      // console.log(agency_reward);
      return agency_reward;
    } else {
      // console.log(response.returnCode.text);
      return {
        staked: amount,
        reward: 0,
      };
    }
  } else {
    console.log('Error');
    return 0;
  }
};

const isOwner = async(agency, address) => {
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
}

const getRewardsHistory = async (query) => {
  if (!query.start || query.start < Phase3.timestamp) {
    query.start = Phase3.timestamp;
  }

  let inner_query = {
    address: query.address,
    receiver: query.agency,
    before: query.stop,
  };

  let data = await getAddressHistory(inner_query);
  let fullEpochsStakedAmounts = {};
  let todayEpoch = getEpoch(Math.floor(Date.now() / 1000));
  let lastEpochHistory = {};
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
    }
  }

  let result = {};
  let providers = {};
  let total = {};
  for (let oneEpoch of Object.keys(fullEpochsStakedAmounts)) {
    if (oneEpoch > Phase3.epoch && fullEpochsStakedAmounts[oneEpoch].staked !== undefined) {
      for (let agencySC of Object.keys(fullEpochsStakedAmounts[oneEpoch].staked)) {
        let savedStaked = fullEpochsStakedAmounts[oneEpoch].staked[agencySC];
        if (!providers[agencySC]) {
          providers[agencySC] = await isOwner(agencySC, query.address);
        }
        let agencyInfo = await calculateReward(parseInt(oneEpoch), savedStaked, agencySC, providers[agencySC]);
        if (!total[agencySC]) {
          total[agencySC] = new BigNumber(agencyInfo['reward']);
        }
        else
        {
          total[agencySC] = total[agencySC].plus(new BigNumber(agencyInfo['reward']));
        }

        console.log(oneEpoch, savedStaked, agencyInfo, agencySC);
        if (!result[oneEpoch]) {
          result[oneEpoch] = { staked: {} };
        }
        result[oneEpoch].staked = {
          ...result[oneEpoch].staked,
          [agencySC]: agencyInfo,
        };
      }
    }
  }
  let full_total = new BigNumber(0);
  Object.keys(total).forEach(function (scAddress) {
    full_total = full_total.plus(total[scAddress]);
    total[scAddress] = parseFloat(total[scAddress].toFixed())
  });

  return {rewards_per_epoch: result, total_per_provider: total, total: parseFloat(full_total.toFixed())};
};

module.exports = getRewardsHistory;
