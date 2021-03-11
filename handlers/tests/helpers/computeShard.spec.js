const getShardOfAddress = require('../../helpers/computeShard');

describe(`Test computeShard helper`, () => {
  let hexPubKey;

  test('PubKey is address of Metachain', async () => {
    hexPubKey =
      '016a0cc797097d060f92cf79d8e90645660c713aa3e5fd4041e4f33639641246ff6ca87fb5f6539f45debfbb338cd7045bee405a423ba994c52c36d141d28213effd36c756008304ed47bf2e08d84153003d8c89a23a969ae098f17064cc2e86';
    const helperResponse = await getShardOfAddress(hexPubKey);
    expect(helperResponse).toBe(2);
  });
});
