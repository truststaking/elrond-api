const axios = require('axios');

const { vmQueryUrl, axiosConfig } = require(`../configs/${process.env.CONFIG}`);

const vmQuery = async ({ contract: scAddress, func: FuncName, caller, args = [] }) => {
  try {
    const {
      data: {
        data: { data },
      },
    } = await axios({
      method: 'post',
      url: `${vmQueryUrl()}/vm-values/query`,
      data: JSON.stringify({ scAddress, FuncName, caller, args }),
      ...axiosConfig,
    });

    return 'ReturnData' in data ? data.ReturnData : data.returnData;
  } catch (error) {
    console.log('Contracts are currently unavailable!');
    return 'ContractsUnavailable';
  }
};

module.exports = vmQuery;
