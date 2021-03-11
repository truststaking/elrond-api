const { axios } = require('./helpers');

const { response } = require('./helpers');
const { gatewayUrl } = require('./configs/config');

exports.handler = async () => {
  try {
    const {
      data: {
        data: {
          config: {
            erd_chain_id: chainId,
            // erd_denomination: denomination,
            erd_gas_per_data_byte: gasPerDataByte,
            erd_min_gas_limit: minGasLimit,
            erd_min_gas_price: minGasPrice,
            erd_min_transaction_version: minTransactionVersion,
            // erd_round_duration: roundDuration,
          },
        },
      },
    } = await axios({
      method: 'get',
      url: `${gatewayUrl()}/network/config`,
    });

    return response({
      data: {
        chainId,
        // denomination,
        gasPerDataByte,
        minGasLimit,
        minGasPrice,
        minTransactionVersion,
        // roundDuration,
      },
    });
  } catch (error) {
    console.error('constants error', error);
    return response({ status: 503 });
  }
};
