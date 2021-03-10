const { handler: stakeHandler } = require('../../stake');
jest.mock('../../helpers/getValidators', () => {
  return jest.fn(() => ({
    totalValidators: 2169,
    queueSize: 328,
  }));
});

let pathParameters = {};
const queryStringParameters = {};
describe(`Test '/stake' endpoint`, () => {
  let handlerResponse;
  beforeAll(async () => {
    handlerResponse = await stakeHandler({ pathParameters, queryStringParameters });
  });

  test('Response totalStaked calculations', () => {
    expect(handlerResponse.statusCode).toBe(200);

    const parsedBody = handlerResponse.body;
    expect(parsedBody.totalStaked).toBe('6242500000000000000000000');
  });
});
