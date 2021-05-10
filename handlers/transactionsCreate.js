const { axios, setForwardedHeaders } = require('./helpers');

const { gatewayUrl } = require(`./configs/${process.env.CONFIG}`);

const { bech32, computeShard, response } = require('./helpers');

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  body,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });
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

    return response({ status: 201, data });
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
