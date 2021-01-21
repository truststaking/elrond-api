const axios = require('axios');

const { gatewayUrl } = require('../config');
const { response } = require('../helpers');

exports.handler = async ({ body }) => {
  try {
    const { sender, receiver } = body;

    const {
      data: {
        data: { txHash },
      },
    } = await axios.post(`${gatewayUrl()}/transaction/send`, body);

    // TODO: pending alignment
    const data = {
      txHash,
      receiver,
      sender,
      receiverShard: null,
      senderShard: null,
      status: 'pending',
    };

    return response({ data });
  } catch (err) {
    // if error http status
    if (err.response) {
      const {
        status,
        data: { error },
      } = err.response;

      return response({ status, data: { error } });
    } else {
      console.error('transaction create error', err);
      return response({ status: 500 });
    }
  }
};
