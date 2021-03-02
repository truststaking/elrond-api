const confirmNodeIdentity = require('../../helpers/confirmNodeIdentity');

jest.mock('axios', () => {
  return {
    head: jest.fn(() => ({ status: 200 })),
  };
});
describe(`Test confirmNodeIdentity helper`, () => {
  let identity;
  let pubKey;
  test('Valid node identity', async () => {
    pubKey =
      '016a0cc797097d060f92cf79d8e90645660c713aa3e5fd4041e4f33639641246ff6ca87fb5f6539f45debfbb338cd7045bee405a423ba994c52c36d141d28213effd36c756008304ed47bf2e08d84153003d8c89a23a969ae098f17064cc2e86';
    identity = 'everstake';
    const helperResponse = await confirmNodeIdentity({ identity, pubKey });
    expect(helperResponse).toBeTruthy();
  });
});
