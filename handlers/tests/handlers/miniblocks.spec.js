const { handler: miniblocksHandler } = require('../../miniblocks');
jest.mock('../../helpers/elasticSearch', () => {
  return {
    getCount: jest.fn(() => 1341305),
    getItem: jest.fn(() => ({
      miniBlockHash: '522adf17adaded196cfe1cace68525fe870873c2759776245cab11b9bb0bdff6',
      receiverBlockHash: 'e834f5ae0c165498f9141d2d3987aef904a1a7574aedd76d465f6021d501ef32',
      receiverShard: 2,
      senderBlockHash: 'e834f5ae0c165498f9141d2d3987aef904a1a7574aedd76d465f6021d501ef32',
      senderShard: 2,
      type: 'TxBlock',
    })),
  };
});

describe(`Test '/miniblocks' endpoint`, () => {
  let pathParameters = {};
  let queryStringParameters = {};

  test('Test /miniblocks/count', async () => {
    pathParameters = { hash: 'count' };
    const { statusCode, body } = await miniblocksHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    expect(body).toBe(1341305);
  });

  test('Test /miniblocks/:{hash}', async () => {
    pathParameters = { hash: '522adf17adaded196cfe1cace68525fe870873c2759776245cab11b9bb0bdff6' };
    const { statusCode, body } = await miniblocksHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    const responseObject = {
      miniBlockHash: '522adf17adaded196cfe1cace68525fe870873c2759776245cab11b9bb0bdff6',
      receiverBlockHash: 'e834f5ae0c165498f9141d2d3987aef904a1a7574aedd76d465f6021d501ef32',
      receiverShard: 2,
      senderBlockHash: 'e834f5ae0c165498f9141d2d3987aef904a1a7574aedd76d465f6021d501ef32',
      senderShard: 2,
      type: 'TxBlock',
    };
    expect(body).toMatchObject(responseObject);
  });
});
