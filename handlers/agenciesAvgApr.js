const { response, getRewardsHistory } = require('./helpers');
const {
  ContractFunction,
  ProxyProvider,
  Address,
  SmartContract,
  QueryResponse,
} = require('@elrondnetwork/erdjs');

const decode = (value) => {
  const hex = Buffer.from(value, 'base64').toString('hex');
  return BigInt(hex ? '0x' + hex : hex).toString();
};

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    let query = queryStringParameters || {};
    let status = 200;
    let proxi = new ProxyProvider('https://gateway.elrond.com', 20000);
    let delegationContract = new SmartContract({
      address: new Address('erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6'),
    });
    let data = await delegationContract.runQuery(proxi, {
      func: new ContractFunction('getAllContractAddresses'),
      args: [],
    });
    let agencies = {};
    for (const provider of data.returnData) {
      let address = Address.fromHex(Buffer.from(provider, 'base64').toString('hex'));
      let contract = new SmartContract({ address: address });
      console.log(address.toString());

      let contractConfig = await contract.runQuery(proxi, {
        func: new ContractFunction('getContractConfig'),
        args: [],
      });

      let owner_address = Address.fromHex(
        Buffer.from(contractConfig.returnData[0], 'base64').toString('hex')
      );

      let provider_name = '';
      try {
        let metaData = await contract.runQuery(proxi, {
          func: new ContractFunction('getMetaData'),
          args: [],
        });
        provider_name = Buffer.from(metaData.returnData[0], 'base64').toString();
        console.log(provider_name);
      } catch (err) {
        provider_name = owner_address;
        console.log(owner_address + err.message);
      }
      let inner_query = {
        address: owner_address.toString(),
        agency: address.toString(),
      };
      try {
        let rewardsHistory = await getRewardsHistory(inner_query);

        let daily_rewards = [];
        for (const [epoch, value] of Object.entries(rewardsHistory.rewards_per_epoch)) {
          if (!(address.toString() in value.staked)) {
            if (daily_rewards.lenght == 0) {
              continue;
            } else {
              daily_rewards.push(0.0);
            }
            // console.log(epoch);
          } else if (!('APRDelegator' in value.staked[address.toString()])) {
            daily_rewards.push(0.0);
            continue;
          }
          daily_rewards.push(parseFloat(value.staked[address.toString()].APRDelegator));
        }
        if (daily_rewards.length > 0) {
          let avg = average(daily_rewards);
          agencies[provider_name] = avg;
          // console.log(provider_name + ' ' + avg.toString());
        } else {
          agencies[provider_name] = 'N/A';
        }
      } catch (error) {
        console.error('error for ' + provider_name + ':' + address.toString());
        console.error('error for wallet:', owner_address.toString());
        console.error('getRewardsHistory error', error);
        continue;
      }
    }
    console.log(status);
    console.log(agencies);
    return response({ status: status, data: agencies });
  } catch (error) {
    console.error('transactions error', error);
    return response({ status: 503 });
  }
};
