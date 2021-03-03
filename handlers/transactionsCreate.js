const { axios } = require('./helpers');

const { gatewayUrl } = require(`./configs/config`);

const { bech32, computeShard, response } = require('./helpers');

exports.handler = async ({ body }) => {
  // TODO: limit body size

  try {
    const { sender, receiver } = JSON.parse(body);

    const receiverShard = computeShard(bech32.decode(receiver));
    const senderShard = computeShard(bech32.decode(sender));

    const {
      data: {
        data: { txHash },
      },
    } = await axios({
      method: 'post',
      url: `${gatewayUrl()}/transaction/send`,
      data: body,
    });

    // TODO: pending alignment
    const data = {
      txHash,
      receiver,
      sender,
      receiverShard,
      senderShard,
      status: 'Pending',
    };

    return response({ data });
  } catch (error) {
    // if error http status
    if (error.response) {
      const { status, data } = error.response;

      return response({ status, data });
    } else {
      console.error('transaction create error', error);
      return response({ status: 503 });
    }
  }
};
