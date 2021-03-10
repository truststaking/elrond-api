const getValidators = require('../../helpers/getValidators');

jest.mock('../../helpers/vmQuery', () => {
  return jest.fn(() => ['MTU=']);
});

jest.mock('../../helpers/getNodes', () => {
  return jest.fn(() => [
    { nodeType: 'validator', peerType: 'waiting', status: 'offline' },
    { nodeType: 'validator', peerType: 'waiting', status: 'online' },
  ]);
});

describe(`Test getValidators helper`, () => {
  test('Test validators', async () => {
    const helperResponse = await getValidators();
    expect(helperResponse.totalValidators).toBe(2);
    expect(helperResponse.activeValidators).toBe(1);
  });
});
