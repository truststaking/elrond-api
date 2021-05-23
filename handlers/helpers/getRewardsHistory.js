const getAddressHistory = require('./getAddressHistory');
const { ContractFunction, ProxyProvider, Address, BytesValue, SmartContract} = require("@elrondnetwork/erdjs");

const Phase3 = {
  timestamp: 1617622200,
  epoch: 249
}

// const mainnet_proxy = new ProxyProvider('https://gateway.elrond.com');

const getEpoch = (timestamp) =>
{
  var diff = timestamp - Phase3.timestamp
  return Phase3.epoch + Math.floor(diff / (60 * 60 * 24));
}


const calculateReward = async (epoch, amount, agency) =>
{
  let hex_epoch = Buffer.from(epoch.toString(), 'hex')
  let provider = new ProxyProvider("https://gateway.elrond.com", 20000);
  let delegationContract = new SmartContract({ address: new Address(agency) });

  let response = await delegationContract.runQuery(provider, {
    func: new ContractFunction("getRewardData"),
    args: [BytesValue.fromHex(epoch.toString(16))]
  });

  //console.log(response);
  return response;
}

const getRewardsHistory = async (query) => {
  var rewardsHistory = {}

  if (query.start < Phase3.timestamp)
  {
    query.start = Phase3.timestamp;
  }

  let inner_query = {
    address: query.address,
    receiver: query.agency,
    before: query.stop,
  }
  data = await getAddressHistory(inner_query);

  Object.keys(data.history).forEach(function(key) {
    if (data.history[key].staked[query.agency])
    {
      rewardsHistory[getEpoch(key)] = data.history[key].staked[query.agency];
    }
  });
  rewardsHistoryFull = {}
  Object.keys(rewardsHistory).forEach(async function(key) {
    console.log("key: "+ key);
    let last_key = parseInt(key);
    let i = 0;
    do {
      let epoch = last_key + i
      console.log("\ti: " + i.toString())
      if ( epoch >= Phase3.epoch)
      {
        let reward = await calculateReward(epoch, rewardsHistory[key], query.agency);
        rewardsHistoryFull[epoch] = (rewardsHistory[last_key], reward);
      }
      i++;
    } while (!(last_key + i in rewardsHistory));
  });

  return rewardsHistory;
};

module.exports = getRewardsHistory;
