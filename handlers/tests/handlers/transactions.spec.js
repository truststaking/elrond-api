const { handler: transactionsHandler } = require('../../transactions');
jest.mock('../../helpers/elasticSearch', () => {
  return {
    getCount: jest.fn(() => 2974155),
    getList: jest.fn(() => [
      {
        txHash: 'b0f9f73a7cf0e4b689386e32072702c6dc76547c3d00f30fdc871778204a35d7',
        searchOrder: 1,
        data: 'c3Rha2U=',
        fee: '358352740000000',
        gasLimit: 250000000,
        gasPrice: 1000000000,
        gasUsed: 30142774,
        miniBlockHash: '8e121831d7088a05e3ab2060b1745c96a855e9d751d1421917cb4ca24538b1c1',
        nonce: 29,
        receiver: 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt',
        receiverShard: 2,
        round: 3020907,
        scResults: [
          {
            relayedValue: '<nil>',
            prevTxHash: 'b0f9f73a7cf0e4b689386e32072702c6dc76547c3d00f30fdc871778204a35d7',
            gasLimit: 0,
            originalTxHash: 'b0f9f73a7cf0e4b689386e32072702c6dc76547c3d00f30fdc871778204a35d7',
            receiver: 'erd18rggn3jkh2wpyay97e3rwsknugvdg9jet06jrnmrafe3w54fq0zsuhd0cv',
            data: 'QDZmNmI=',
            sender: 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt',
            nonce: 30,
            value: '2198572260000000',
            hash: '667edf623f61e424817dc65c0dcf4f3d7d567294adcbded06b35b1a706f95040',
            callType: '0',
            gasPrice: 1000000000,
          },
        ],
        sender: 'erd18rggn3jkh2wpyay97e3rwsknugvdg9jet06jrnmrafe3w54fq0zsuhd0cv',
        senderShard: 1,
        signature:
          'a7ba821d3e54edda0ac366d57263976b13208e0507e3957e49826a23f3d44beeeebf1a81d39326a7459b01c32c6f14912125de4f47429c4d552b251a6e1eb00d',
        status: 'success',
        timestamp: 1614243066,
        value: '12000000000000000000',
      },
      {
        txHash: 'f2e2ca9e105fec76f3eaadeb62a10fb7dee33ff8983b319a5459999a1d26a2d3',
        fee: '50000000000000',
        searchOrder: 2,
        gasLimit: 50000,
        gasPrice: 1000000000,
        gasUsed: 50000,
        miniBlockHash: 'a3f2e3c49e0ec1c1913fc96931f92162d52cf03724bf860429a0396637bfaa0c',
        nonce: 1,
        receiver: 'erd1s9qt7grfyljzepux24pfmttupnhwz57m8mgzlf2xqj599qe9y06qwvuk2r',
        receiverShard: 0,
        round: 3020902,
        sender: 'erd1vwgn7xmw9ja7wsqk8xh07vz6y7n7300pj00gft3vp2ve5e6vg94qgj8e8c',
        senderShard: 2,
        signature:
          '5b7d9cf0e17663128592282777156cc2753fc177876a6e8d00956c28124a626be67ae343980b1e9895fb245fa723e5cd3001bdc4d046073a671816691daacc0b',
        status: 'success',
        timestamp: 1614243036,
        value: '2390000000000000000',
      },
    ]),
    getItem: jest.fn(() => ({
      txHash: 'f2e2ca9e105fec76f3eaadeb62a10fb7dee33ff8983b319a5459999a1d26a2d3',
      fee: '50000000000000',
      searchOrder: 2,
      gasLimit: 50000,
      gasPrice: 1000000000,
      gasUsed: 50000,
      miniBlockHash: 'a3f2e3c49e0ec1c1913fc96931f92162d52cf03724bf860429a0396637bfaa0c',
      nonce: 1,
      receiver: 'erd1s9qt7grfyljzepux24pfmttupnhwz57m8mgzlf2xqj599qe9y06qwvuk2r',
      receiverShard: 0,
      round: 3020902,
      sender: 'erd1vwgn7xmw9ja7wsqk8xh07vz6y7n7300pj00gft3vp2ve5e6vg94qgj8e8c',
      senderShard: 2,
      signature:
        '5b7d9cf0e17663128592282777156cc2753fc177876a6e8d00956c28124a626be67ae343980b1e9895fb245fa723e5cd3001bdc4d046073a671816691daacc0b',
      status: 'success',
      timestamp: 1614243036,
      value: '2390000000000000000',
    })),
  };
});

describe(`Test '/transactions' endpoint`, () => {
  let pathParameters = {};
  let queryStringParameters = {};

  test('Test /transactions', async () => {
    const { statusCode, body } = await transactionsHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    const responseObject = [
      {
        txHash: 'b0f9f73a7cf0e4b689386e32072702c6dc76547c3d00f30fdc871778204a35d7',
        data: 'c3Rha2U=',
        fee: '358352740000000',
        gasLimit: 250000000,
        gasPrice: 1000000000,
        gasUsed: 30142774,
        miniBlockHash: '8e121831d7088a05e3ab2060b1745c96a855e9d751d1421917cb4ca24538b1c1',
        nonce: 29,
        receiver: 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt',
        receiverShard: 2,
        round: 3020907,
        scResults: [
          {
            relayedValue: '<nil>',
            prevTxHash: 'b0f9f73a7cf0e4b689386e32072702c6dc76547c3d00f30fdc871778204a35d7',
            gasLimit: 0,
            originalTxHash: 'b0f9f73a7cf0e4b689386e32072702c6dc76547c3d00f30fdc871778204a35d7',
            receiver: 'erd18rggn3jkh2wpyay97e3rwsknugvdg9jet06jrnmrafe3w54fq0zsuhd0cv',
            data: 'QDZmNmI=',
            sender: 'erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt',
            nonce: 30,
            value: '2198572260000000',
            hash: '667edf623f61e424817dc65c0dcf4f3d7d567294adcbded06b35b1a706f95040',
            callType: '0',
            gasPrice: 1000000000,
          },
        ],
        sender: 'erd18rggn3jkh2wpyay97e3rwsknugvdg9jet06jrnmrafe3w54fq0zsuhd0cv',
        senderShard: 1,
        signature:
          'a7ba821d3e54edda0ac366d57263976b13208e0507e3957e49826a23f3d44beeeebf1a81d39326a7459b01c32c6f14912125de4f47429c4d552b251a6e1eb00d',
        status: 'success',
        timestamp: 1614243066,
        value: '12000000000000000000',
      },
      {
        txHash: 'f2e2ca9e105fec76f3eaadeb62a10fb7dee33ff8983b319a5459999a1d26a2d3',
        fee: '50000000000000',
        gasLimit: 50000,
        gasPrice: 1000000000,
        gasUsed: 50000,
        miniBlockHash: 'a3f2e3c49e0ec1c1913fc96931f92162d52cf03724bf860429a0396637bfaa0c',
        nonce: 1,
        receiver: 'erd1s9qt7grfyljzepux24pfmttupnhwz57m8mgzlf2xqj599qe9y06qwvuk2r',
        receiverShard: 0,
        round: 3020902,
        sender: 'erd1vwgn7xmw9ja7wsqk8xh07vz6y7n7300pj00gft3vp2ve5e6vg94qgj8e8c',
        senderShard: 2,
        signature:
          '5b7d9cf0e17663128592282777156cc2753fc177876a6e8d00956c28124a626be67ae343980b1e9895fb245fa723e5cd3001bdc4d046073a671816691daacc0b',
        status: 'success',
        timestamp: 1614243036,
        value: '2390000000000000000',
      },
    ];
    expect(body).toMatchObject(responseObject);
  });

  test('Test /transactions/count', async () => {
    pathParameters = { hash: 'count' };
    const { statusCode, body } = await transactionsHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    expect(body).toBe(2974155);
  });

  test('Test /transactions/:{hash}', async () => {
    pathParameters = { hash: 'f2e2ca9e105fec76f3eaadeb62a10fb7dee33ff8983b319a5459999a1d26a2d3' };
    const { statusCode, body } = await transactionsHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCode).toBe(200);

    const responseObject = {
      txHash: 'f2e2ca9e105fec76f3eaadeb62a10fb7dee33ff8983b319a5459999a1d26a2d3',
      fee: '50000000000000',
      gasLimit: 50000,
      gasPrice: 1000000000,
      gasUsed: 50000,
      miniBlockHash: 'a3f2e3c49e0ec1c1913fc96931f92162d52cf03724bf860429a0396637bfaa0c',
      nonce: 1,
      receiver: 'erd1s9qt7grfyljzepux24pfmttupnhwz57m8mgzlf2xqj599qe9y06qwvuk2r',
      receiverShard: 0,
      round: 3020902,
      sender: 'erd1vwgn7xmw9ja7wsqk8xh07vz6y7n7300pj00gft3vp2ve5e6vg94qgj8e8c',
      senderShard: 2,
      signature:
        '5b7d9cf0e17663128592282777156cc2753fc177876a6e8d00956c28124a626be67ae343980b1e9895fb245fa723e5cd3001bdc4d046073a671816691daacc0b',
      status: 'success',
      timestamp: 1614243036,
      value: '2390000000000000000',
    };
    expect(body).toMatchObject(responseObject);
  });
});
