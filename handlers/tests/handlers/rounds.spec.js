const { handler: roundsHandler } = require('../../rounds');
jest.mock('../../helpers/elasticSearch', () => {
  return {
    getCount: jest.fn(() => 100),
    getList: jest.fn(() => [
      {
        key: '1_209',
        blockWasProposed: true,
        round: 3020809,
        shard: 1,
        timestamp: 1614242454,
        signersIndexes: [0, 1],
      },
      {
        key: '0_209',
        blockWasProposed: true,
        round: 3020809,
        shard: 0,
        timestamp: 1614242454,
        signersIndexes: [1, 2],
      },
    ]),
    getPublicKeys: jest.fn(() => [
      'caa7007b6e1c21f84e6a451123c2488245382a062a4583588e377ed9392f1ea83ed1ff0c7a75b47bf7635e978f8b1f0f5f5bf7eec6d6e4e5de659781ab5de7697b8b72a96d457654503a67ecbea80999ed87982d6ec0e405b59367f33e246597',
      'c216760d77b53f0307b30d0be058fdcf0590949e906a0586cce4bd150b681071b6eabf8a3d3235247ca6d754b511c313c5ce65fa200b751d1053a6c18133496b1669ad199b12110c4d2680035899d10baecd10a82e4f9d8ca64fb08d074e0010',
      '8323a042537c0953b82616d871e2ab8e183729343946a8c8c7e92ae7c625e85f13fa19a01952bd8cb3ffeb749a4bae00ac46067eb21e13b8bfb3af4762dc229dc7d036b3911cd7657a80be37c99468185c18d66fa24b3466cd21d4bceda15186',
    ]),
  };
});

describe(`Test '/rounds' endpoint`, () => {
  let pathParameters = {};
  let queryStringParameters = {};

  test('Test /rounds', async () => {
    const { statusCode, body } = await roundsHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    const firstRound = {
      blockWasProposed: true,
      round: 3020809,
      shard: 1,
      timestamp: 1614242454,
      signers: [
        'caa7007b6e1c21f84e6a451123c2488245382a062a4583588e377ed9392f1ea83ed1ff0c7a75b47bf7635e978f8b1f0f5f5bf7eec6d6e4e5de659781ab5de7697b8b72a96d457654503a67ecbea80999ed87982d6ec0e405b59367f33e246597',
        'c216760d77b53f0307b30d0be058fdcf0590949e906a0586cce4bd150b681071b6eabf8a3d3235247ca6d754b511c313c5ce65fa200b751d1053a6c18133496b1669ad199b12110c4d2680035899d10baecd10a82e4f9d8ca64fb08d074e0010',
      ],
    };
    const secondRound = {
      blockWasProposed: true,
      round: 3020809,
      shard: 0,
      timestamp: 1614242454,
      signers: [
        'c216760d77b53f0307b30d0be058fdcf0590949e906a0586cce4bd150b681071b6eabf8a3d3235247ca6d754b511c313c5ce65fa200b751d1053a6c18133496b1669ad199b12110c4d2680035899d10baecd10a82e4f9d8ca64fb08d074e0010',
        '8323a042537c0953b82616d871e2ab8e183729343946a8c8c7e92ae7c625e85f13fa19a01952bd8cb3ffeb749a4bae00ac46067eb21e13b8bfb3af4762dc229dc7d036b3911cd7657a80be37c99468185c18d66fa24b3466cd21d4bceda15186',
      ],
    };
    expect(body).toContainEqual(firstRound);
    expect(body).toContainEqual(secondRound);
  });
});
