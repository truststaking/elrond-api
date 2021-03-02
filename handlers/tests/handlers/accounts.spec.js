const { handler: accountsHandler } = require('../../accounts');
jest.mock('../../helpers/elasticSearch', () => {
  return {
    getCount: jest.fn(() => 361624),
    getList: jest.fn(() => [
      {
        address: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l',
        balance: '6255017500000000000000000',
        nonce: 1,
        balanceNum: 100,
      },
      {
        address: 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt',
        balance: '3402435298690437051711681',
        nonce: 0,
        balanceNum: 30,
      },
    ]),
  };
});

jest.mock('axios', () => {
  return {
    get: jest.fn(() => {
      return {
        data: {
          data: {
            account: {
              address: 'erd1sea63y47u569ns3x5mqjf4vnygn9whkk7p6ry4rfpqyd6rd5addqyd9lf2',
              nonce: 1,
              balance: '6255017500000000000000000',
              rootHash: '0j2sgjtTpmoYPAz63YGDeD+G4AaQygfzAlXAIrlofpo=',
              code: 1,
              codeHash: '0j2sgjtTpmoYPAz63YGDeD+G4AaQygfzAlXAIrlofpo=',
            },
          },
        },
      };
    }),
    post: jest.fn(() => {
      return {
        data: { count: 657 },
      };
    }),
  };
});

describe(`Test '/accounts' endpoint`, () => {
  let pathParameters = {};
  let queryStringParameters = {};

  test('Test /accounts', async () => {
    const { statusCode, body } = await accountsHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    const responseObject = [
      {
        address: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l',
        balance: '6255017500000000000000000',
        nonce: 1,
      },
      {
        address: 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt',
        balance: '3402435298690437051711681',
        nonce: 0,
      },
    ];
    expect(JSON.stringify(body)).toBe(JSON.stringify(responseObject));
  });

  test('Test /accounts/count', async () => {
    pathParameters = { hash: 'count' };
    const { statusCode, body } = await accountsHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    expect(body).toBe(361624);
  });

  test('Test /accounts/:{hash}', async () => {
    pathParameters = { hash: 'erd1sea63y47u569ns3x5mqjf4vnygn9whkk7p6ry4rfpqyd6rd5addqyd9lf2' };
    const { statusCode, body } = await accountsHandler({
      pathParameters,
      queryStringParameters,
    });

    expect(statusCode).toBe(200);

    const responseObject = {
      address: 'erd1sea63y47u569ns3x5mqjf4vnygn9whkk7p6ry4rfpqyd6rd5addqyd9lf2',
      nonce: 1,
      balance: '6255017500000000000000000',
      rootHash: '0j2sgjtTpmoYPAz63YGDeD+G4AaQygfzAlXAIrlofpo=',
      txCount: 657,
    };
    expect(body).toMatchObject(responseObject);
  });
});
