const getAddressHistory = require('./getAddressHistory');
const {
  ContractFunction,
  ProxyProvider,
  Address,
  BytesValue,
  SmartContract,
} = require('@elrondnetwork/erdjs');

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

const calculateReward = async (epoch, amount, agency) => {
  let res = getTimestampByEpoch(epoch);
  let provider = new ProxyProvider('https://gateway.elrond.com', 20000);
  let delegationContract = new SmartContract({ address: new Address(agency) });

  console.log('epoch: ' + epoch.toString() + " -hex:" + BytesValue.fromHex(Buffer.from(epoch.toString()).toString('hex')));

  let response = await delegationContract.runQuery(provider, {
    func: new ContractFunction('getRewardData'),
    args: [BytesValue.fromHex('4EFCB')], //BytesValue.fromHex(Buffer.from(epoch.toString())
  });

  console.log(response);
  return response;
};

const getRewardsHistory = async (query) => {
  var rewardsHistory = {};

  if (query.start < Phase3.timestamp) {
    query.start = Phase3.timestamp;
  }

  let inner_query = {
    address: query.address,
    receiver: query.agency,
    before: query.stop,
  };
  let data = await getAddressHistory(inner_query);

  Object.keys(data.history).forEach(function (epoch) {
    Object.keys(data.history[epoch]).forEach(function (timestamp) {
    if (data.history[epoch][timestamp].staked[query.agency]) {
      if (!(epoch in rewardsHistory))
      {
        rewardsHistory[epoch] = {};
      }
      rewardsHistory[epoch][query.agency] = data.history[epoch][timestamp].staked[query.agency];
    }
    });
  });
  let epochs = Object.keys(rewardsHistory)
  epochs = epochs.slice(0, epochs.length - 1)
  for (let epoch of epochs) {
    let staked = query.agency in rewardsHistory[epoch] ? rewardsHistory[epoch][query.agency] : 0;
    let last_epoch = parseInt(epoch);
    let i = 0;
    do {
      let current_epoch = last_epoch + i;
      console.log('\ti: ' + i.toString());
      if (current_epoch >= Phase3.epoch && staked != 0) {
        let reward = await calculateReward(current_epoch, staked, query.agency);
        if (!(current_epoch in rewardsHistory))
        {
          rewardsHistory[current_epoch] = {};
        }
        rewardsHistory[current_epoch][query.agency] = (rewardsHistory[last_epoch][query.agency], reward);
      }
      i++;
    } while (!(last_epoch + i in rewardsHistory));
  }
  return rewardsHistory;
};

module.exports = getRewardsHistory;
