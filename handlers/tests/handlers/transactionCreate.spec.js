const { handler: transactionsCreateHandler } = require('../../transactionsCreate');
jest.mock('../../helpers/axiosWrapper', () => {
  return {
    axios: jest.fn(() => ({
      data: {
        data: { txHash: '859986a295a2e68e0cd5f9a8fe37d378883e053c11fec6d5bf9ced9d2c8561ea' },
      },
    })),
  };
});

describe(`Test '/transaction/send' endpoint`, () => {
  let body = {};

  test('Test transaction create', async () => {
    body = {
      sender: 'erd1lgtrza8q2p8zzrdger0lpsh6z9mxrscxa68mxxnjg3cxq9dvmezqsjdz3g',
      receiver: 'erd1hj7excak3jxfryagl74vyg0shxg2v4qu0gfzpkec4dcs0m7tzkwq7p968g',
    };
    const { statusCode, body: responseBody } = await transactionsCreateHandler({
      body,
    });
    expect(statusCode).toBe(200);

    expect(responseBody).toMatchObject({
      txHash: '859986a295a2e68e0cd5f9a8fe37d378883e053c11fec6d5bf9ced9d2c8561ea',
      receiver: 'erd1hj7excak3jxfryagl74vyg0shxg2v4qu0gfzpkec4dcs0m7tzkwq7p968g',
      sender: 'erd1lgtrza8q2p8zzrdger0lpsh6z9mxrscxa68mxxnjg3cxq9dvmezqsjdz3g',
      receiverShard: 0,
      senderShard: 0,
      status: 'Pending',
    });
  });
});
