const mockGetCache = jest.fn(({ key }) => undefined);
const mockPutCache = jest.fn(({ key, value, ttl }) => undefined);
const mockBatchGetCache = jest.fn(() => ['TFC-eef207']);
const mockBatchPutCache = jest.fn(() => undefined);

module.exports = {
  getCache: mockGetCache,
  putCache: mockPutCache,
  batchGetCache: mockBatchGetCache,
  batchPutCache: mockBatchPutCache,
};
