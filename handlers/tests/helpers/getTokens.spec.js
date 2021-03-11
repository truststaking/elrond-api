const getTokens = require('../../helpers/getTokens');

jest.mock('../../helpers/cache');

jest.mock('../../helpers/vmQuery', () => {
  return jest.fn(() => [
    'VEZDLWVlZjIwN0BURkMtNTdhNDllQFRGQy1lZTU2YTRAVEZDLTY0OTMwMkBURkMtYWNiMjg4QFRGQy0yYmIwNWRAVFQ3Nzc4LWZmMjgzY0BUU0stZjVhZDE1QFRTSy1jZmFiYzhAREVWLWI2ZjFmMUBURkMtMTVkZjQ4QFRGQy05YWEwNzVAVEZDLTQyMjc1Y0BURkMtNTg3ODcwQFJPTi0xMTU4NTVAVEZDLTI0NTI1MUBPWFNZLWEwZjYzN0BNQVJLLWU4YTRmOUBNSUlVLWYzMjViZUBFREVWLTdiN2RjZUBBTEMtZGNiNmZlQFdFR0xELTEwYTU5YUBEUkFLTy04NDk5NTRAU0dQLWQ0Nzk5NUBTQ1QtZTBjM2MwQEFBVC0wOTY0Y2NAUEFXUy0xMTFhNmJAREFDU0MtYmY0NWIzQERBQ1NDLWY1OTFiZUBDT1NUSS0xMmFmODJATE9PU1NTLWZlZmIwN0BMT09TU1MtYjczZmMyQFpaWlpaWjA3LTRmNzhmYkBNQVgtODNiMmE1QFJPTi02NzU5ZDBAUExTSEMtOWZkYjNkQFJWQy03Yzg1MTBAQ0lPUkJBLTc5YTBiN0BKVVYtMGRlMjYxQERFVi01NWE0ODJAQkFJLTAzNzcxNEBERVYtN2Y5MTY4QFNQVC0zNWIwNzBASEhDLTgxMzk1NUBSVkNPSU4tZGZhMWFiQFRNQy0yY2MxZjZARFVEVUxFQ08tMTBkNjdkQEhIQ09JTi00ODNhMWFAUERDLWQ1OTljMkBMRUdMRC1kOGI0NmNAQ0xBLTNiYTk4ZkBBQUEtYWQ3YTFiQE9QRU5DT0lOLWVkY2FkN0BUVE8tNjUwNDM4QE1SUy1jYTZhZmZATVJTLTVhOTA3M0BESU1FTElFLWZkM2M0ZUBFQ0MtMWI3NDUzQEJVU0QtMTUxODRkQFNIT0QtMmNiOTQzQFRFU1RUT0tFTk4tNzE2ODhhQEVVUk8tNjQzODYzQFdFR0xELWVmNWQ2ZEBXRUdMRC1kNzA0NDNAV0VHTEQtNWEzNmNjQFdFR0xELWRjNmJjZkBXRUdMRC1iYzQwZmNARUJVU0QtZWJjZjQwQE5PUk1BLWQzMGVmMkBMUFRPS0VOLWY1MDIzN0BEUlQtMzBjYzAxQFNZQlItZjM5M2I2QE1JMjAyMS01ZTljNDU=',
  ]);
});

jest.mock('../../helpers/getChunks', () => {
  return jest.fn(() => [['TFC-eef207']]);
});

jest.mock('../../helpers/getTokenProperties', () => {
  return jest.fn(() => ({
    tokenName: 'TokenForgeCoin',
    ownerAddress: 'erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th',
    mintedValue: '1000000000000000000000000',
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
  }));
});

describe(`Test getTokens helper`, () => {
  test('Valid tokens', async () => {
    const helperResponse = await getTokens();

    expect(helperResponse[0]).toBe('TFC-eef207');

    const responseObject = {
      tokenName: 'TokenForgeCoin',
      ownerAddress: 'erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th',
      mintedValue: '1000000000000000000000000',
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
    expect(helperResponse[1]).toMatchObject(responseObject);
  });
});
