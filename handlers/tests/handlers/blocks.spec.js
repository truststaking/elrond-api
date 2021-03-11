const { handler: blocksHandler } = require('../../blocks');
jest.mock('../../helpers/elasticSearch', () => {
  return {
    getCount: jest.fn(() => 12073851),
    getList: jest.fn(() => [
      {
        hash: '20281ee6b80de9dd3fcb025102e337628fb5a36f4a92a15908760d3ba8197a81',
        epoch: 209,
        nonce: 3019828,
        prevHash: '0964e489c59cdae7b65bea25efc79a9384d2cdd305c44de0f4e1739cfe4208d9',
        proposer: 0,
        pubKeyBitmap: 'ffffffffffffff7f',
        round: 3020191,
        shard: 0,
        size: 391,
        sizeTxs: 0,
        stateRootHash: 'a28244df4d5232726d822aaa5832806afcca023eec30d327a95f04229ac73885',
        timestamp: 1614238746,
        txCount: 0,
        validators: [0, 1, 2],
      },
    ]),
    getItem: jest.fn(() => ({
      hash: '20281ee6b80de9dd3fcb025102e337628fb5a36f4a92a15908760d3ba8197a81',
      epoch: 209,
      nonce: 3019828,
      prevHash: '0964e489c59cdae7b65bea25efc79a9384d2cdd305c44de0f4e1739cfe4208d9',
      proposer: 0,
      pubKeyBitmap: 'ffffffffffffff7f',
      round: 3020191,
      shard: 0,
      size: 391,
      sizeTxs: 0,
      stateRootHash: 'a28244df4d5232726d822aaa5832806afcca023eec30d327a95f04229ac73885',
      timestamp: 1614238746,
      txCount: 0,
      validators: [0, 1, 2],
    })),
    getPublicKeys: jest.fn(() => [
      '7d2744157ca4c496a04121f8b906d95281bf5413365aba174f2d34e59832809f4c4b6971a72475b47e023559d75ee00fa688c61e58971c48844f847c1f364f64ac8ab571681d99b95cd5935224d71eabe0c940c1a82633b0a4455f027b024b96',
      '38371019681f9990ecb1334eff95f38a5db7b82355c8f8585ea0935e29cf8a3ee1106355d35c6ce125aeec4afb717312db467cfde41e59ba3b545fa7e597d507d342762c445aacbabec134df49a33f1659a7e6a1ab4202e22dce559301b95e95',
      'ff24743593798e4dcf815e39b7a19c9b70e0cd7c7d86e5c38392c408091a1a7ce478915e776e581426beb09417e2f212bed3f46e17e5fe153e8b918a9f0fa2cd59b866a9a4b28156118d3f47016d702092aa35e3c0e7f89801971041faa8cb14',
    ]),
  };
});

describe(`Test '/blocks' endpoint`, () => {
  let pathParameters = {};
  let queryStringParameters = {};

  test('Test /blocks', async () => {
    const { statusCode, body } = await blocksHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    const responseObject = {
      hash: '20281ee6b80de9dd3fcb025102e337628fb5a36f4a92a15908760d3ba8197a81',
      epoch: 209,
      nonce: 3019828,
      prevHash: '0964e489c59cdae7b65bea25efc79a9384d2cdd305c44de0f4e1739cfe4208d9',
      proposer:
        '7d2744157ca4c496a04121f8b906d95281bf5413365aba174f2d34e59832809f4c4b6971a72475b47e023559d75ee00fa688c61e58971c48844f847c1f364f64ac8ab571681d99b95cd5935224d71eabe0c940c1a82633b0a4455f027b024b96',
      pubKeyBitmap: 'ffffffffffffff7f',
      round: 3020191,
      shard: 0,
      size: 391,
      sizeTxs: 0,
      stateRootHash: 'a28244df4d5232726d822aaa5832806afcca023eec30d327a95f04229ac73885',
      timestamp: 1614238746,
      txCount: 0,
      validators: [
        '7d2744157ca4c496a04121f8b906d95281bf5413365aba174f2d34e59832809f4c4b6971a72475b47e023559d75ee00fa688c61e58971c48844f847c1f364f64ac8ab571681d99b95cd5935224d71eabe0c940c1a82633b0a4455f027b024b96',
        '38371019681f9990ecb1334eff95f38a5db7b82355c8f8585ea0935e29cf8a3ee1106355d35c6ce125aeec4afb717312db467cfde41e59ba3b545fa7e597d507d342762c445aacbabec134df49a33f1659a7e6a1ab4202e22dce559301b95e95',
        'ff24743593798e4dcf815e39b7a19c9b70e0cd7c7d86e5c38392c408091a1a7ce478915e776e581426beb09417e2f212bed3f46e17e5fe153e8b918a9f0fa2cd59b866a9a4b28156118d3f47016d702092aa35e3c0e7f89801971041faa8cb14',
      ],
    };

    expect(body).toContainEqual(responseObject);
  });

  test('Test /blocks/count', async () => {
    pathParameters = { hash: 'count' };
    const { statusCode, body } = await blocksHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    expect(body).toBe(12073851);
  });

  test('Test /blocks/:{hash}', async () => {
    pathParameters = { hash: '20281ee6b80de9dd3fcb025102e337628fb5a36f4a92a15908760d3ba8197a81' };
    const { statusCode, body } = await blocksHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    const responseObject = {
      hash: '20281ee6b80de9dd3fcb025102e337628fb5a36f4a92a15908760d3ba8197a81',
      epoch: 209,
      nonce: 3019828,
      prevHash: '0964e489c59cdae7b65bea25efc79a9384d2cdd305c44de0f4e1739cfe4208d9',
      proposer:
        '7d2744157ca4c496a04121f8b906d95281bf5413365aba174f2d34e59832809f4c4b6971a72475b47e023559d75ee00fa688c61e58971c48844f847c1f364f64ac8ab571681d99b95cd5935224d71eabe0c940c1a82633b0a4455f027b024b96',
      pubKeyBitmap: 'ffffffffffffff7f',
      round: 3020191,
      shard: 0,
      size: 391,
      sizeTxs: 0,
      stateRootHash: 'a28244df4d5232726d822aaa5832806afcca023eec30d327a95f04229ac73885',
      timestamp: 1614238746,
      txCount: 0,
      validators: [
        '7d2744157ca4c496a04121f8b906d95281bf5413365aba174f2d34e59832809f4c4b6971a72475b47e023559d75ee00fa688c61e58971c48844f847c1f364f64ac8ab571681d99b95cd5935224d71eabe0c940c1a82633b0a4455f027b024b96',
        '38371019681f9990ecb1334eff95f38a5db7b82355c8f8585ea0935e29cf8a3ee1106355d35c6ce125aeec4afb717312db467cfde41e59ba3b545fa7e597d507d342762c445aacbabec134df49a33f1659a7e6a1ab4202e22dce559301b95e95',
        'ff24743593798e4dcf815e39b7a19c9b70e0cd7c7d86e5c38392c408091a1a7ce478915e776e581426beb09417e2f212bed3f46e17e5fe153e8b918a9f0fa2cd59b866a9a4b28156118d3f47016d702092aa35e3c0e7f89801971041faa8cb14',
      ],
    };
    expect(body).toMatchObject(responseObject);
  });
});
