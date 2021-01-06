const axios = require('axios');

const { vmQueryUrl } = require('../config');

const vmQuery = async ({ contract: scAddress, func: FuncName, caller, args = [] }) => {
  const {
    data: {
      data: { data },
    },
  } = await axios({
    method: 'post',
    url: `${vmQueryUrl()}/vm-values/query`,
    data: JSON.stringify({ scAddress, FuncName, caller, args }),
  });

  return 'ReturnData' in data ? data.ReturnData : data.returnData;
};

module.exports = vmQuery;
