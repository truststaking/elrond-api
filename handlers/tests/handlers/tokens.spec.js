const { handler: tokensHandler } = require('../../tokens');
jest.mock('../../helpers/cache');

jest.mock('../../helpers/getTokens', () => {
  return jest.fn(() => [
    {
      tokenIdentifier: 'token1',
    },
    {
      tokenIdentifier: 'token2',
    },
  ]);
});

jest.mock('axios', () => {
  return {
    get: jest.fn((url) => {
      if (url.includes('token')) {
        return {
          data: {
            data: {
              tokenData: { balance: 100 },
            },
          },
        };
      }
      return {
        data: {
          data: {
            tokens: ['token1'],
          },
        },
      };
    }),
  };
});

let pathParameters = {};
const queryStringParameters = {};
describe(`Test '/tokens' endpoint`, () => {
  test('Filter adress tokens', async () => {
    pathParameters = { hash: 'address' };
    const { statusCode, body } = await tokensHandler({
      pathParameters,
      queryStringParameters,
    });

    expect(statusCode).toBe(200);

    expect(body.length).toBe(1);
    expect(body[0].tokenIdentifier).toBe('token1');
  });

  test('Find token by token identifier', async () => {
    pathParameters = { identifier: 'token1' };
    const { statusCode } = await tokensHandler({
      pathParameters,
      queryStringParameters,
    });

    expect(statusCode).toBe(200);

    pathParameters = { identifier: 'token3' };
    const { statusCode: statusCodeFail } = await tokensHandler({
      pathParameters,
      queryStringParameters,
    });
    expect(statusCodeFail).toBe(404);
  });

  test('Count tokens', async () => {
    pathParameters = { identifier: 'count' };
    const { statusCode, body } = await tokensHandler({
      pathParameters,
      queryStringParameters,
    });

    expect(statusCode).toBe(200);
    const parsedBody = JSON.parse(body);
    expect(parsedBody).toBe(2);
  });
});
