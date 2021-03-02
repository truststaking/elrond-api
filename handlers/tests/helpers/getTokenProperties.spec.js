const getTokenProperties = require('../../helpers/getTokenProperties');

jest.mock('../../helpers/vmQuery', () => {
  return jest.fn(() => [
    'NTQ2ZjZiNjU2ZTQ2NmY3MjY3NjU0MzZmNjk2ZQ==',
    'MXF5dTV3dGhsZHpyOHd4NWM5dWNnOGtqYWdnMGpmczUzczhucjN6cHozaHlwZWZzZGQ4c3N5Y3I2dGg=',
    'RDNDMjFCQ0VDQ0VEQTEwMDAwMDA=',
    'MA==',
    'MTg=',
    'ZmFsc2U=',
    'ZmFsc2U=',
    'ZmFsc2U=',
    'ZmFsc2U=',
    'ZmFsc2U=',
    'ZmFsc2U=',
    'ZmFsc2U=',
    'ZmFsc2U=',
  ]);
});
jest.mock('../../helpers/bech32', () => {
  return {
    encode: jest.fn(() => 'erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th'),
  };
});

describe(`Test getTokenProperties helper`, () => {
  let tokenIdentifier = 'TFC-ee56a4';
  test('Test properties', async () => {
    const helperResponse = await getTokenProperties(tokenIdentifier);
    const responseObject = {
      tokenIdentifier: 'TFC-ee56a4',
      tokenName: '546f6b656e466f726765436f696e',
      ownerAddress: 'erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th',
      mintedValue: 'D3C21BCECCEDA1000000',
      burntValue: '0',
      numDecimals: 18,
      isPaused: false,
      canUpgrade: false,
      canMint: false,
      canBurn: false,
      canChangeOwner: false,
      canPause: false,
      canFreeze: false,
      canWipe: false,
    };
    expect(helperResponse).toMatchObject(responseObject);
  });
});
