const getChunks = require('../../helpers/getChunks');

describe(`Test getChunks helper`, () => {
  let array = [1, 2, 3, 4];
  let size = 2;
  test('Test num of chunks', async () => {
    const helperResponse = await getChunks(array, size);
    expect(helperResponse.length).toBe(2);
  });
});
