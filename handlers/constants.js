const axios = require('axios');

const { response } = require('./helpers');

const { gatewayUrl, axiosConfig } = require(`./configs/${process.env.CONFIG}`);

exports.handler = async () => {
  try {
    const {
      data: {
        data: {
          config: {
            erd_chain_id: chainId,
            erd_gas_per_data_byte: gasPerDataByte,
            erd_min_gas_limit: minGasLimit,
            erd_min_gas_price: minGasPrice,
            erd_min_transaction_version: minTransactionVersion,
          },
        },
      },
    } = await axios.get(`${gatewayUrl()}/network/config`, axiosConfig);

    return response({
      data: {
        chainId,
        gasPerDataByte,
        minGasLimit,
        minGasPrice,
        minTransactionVersion,
      },
    });
  } catch (error) {
    console.error('constants error', error);
    return response({ status: 503 });
  }
};
