const getNodes = require('../../helpers/getNodes');

jest.mock('../../helpers/cache');

jest.mock('axios', () => {
  return {
    get: jest.fn((url) => {
      if (url.includes('heartbeatstatus'))
        return {
          data: {
            data: {
              heartbeats: [
                {
                  timeStamp: '2021-02-25T14:35:12.068373783Z',
                  publicKey:
                    '002576a00bedd8d3dd6f6e5ec74ed0a31a401d48fd5a00e710962c65a97acb156033daaec449e9ec39d5276f0bc2d50c7df8bef75167f2368424971801a5add4ac671d67cfdf4a5f5e055acce419d20ff3e2751d252a44001a7c1c41c89f3b8f',
                  versionNumber: 'v1.1.26.0-0-g9e5853f9f/go1.15.5/linux-amd64/7cbb2639ac',
                  nodeDisplayName: 'Elrond-Bootnode-29-1',
                  identity: 'elrondcom',
                  totalUpTimeSec: 9934273,
                  totalDownTimeSec: 808,
                  maxInactiveTime: '2280h51m27.856842656s',
                  receivedShardID: 2,
                  computedShardID: 2,
                  peerType: 'eligible',
                  isActive: true,
                  nonce: 3023924,
                  numInstances: 1,
                },
              ],
            },
          },
        };
      if (url.includes('statistics'))
        return {
          data: {
            data: {
              statistics: {
                '002576a00bedd8d3dd6f6e5ec74ed0a31a401d48fd5a00e710962c65a97acb156033daaec449e9ec39d5276f0bc2d50c7df8bef75167f2368424971801a5add4ac671d67cfdf4a5f5e055acce419d20ff3e2751d252a44001a7c1c41c89f3b8f': {
                  tempRating: 100,
                  numLeaderSuccess: 0,
                  numLeaderFailure: 0,
                  numValidatorSuccess: 19,
                  numValidatorFailure: 0,
                  numValidatorIgnoredSignatures: 0,
                  rating: 100,
                  ratingModifier: 1.2,
                  totalNumLeaderSuccess: 5410,
                  totalNumLeaderFailure: 4,
                  totalNumValidatorSuccess: 809282,
                  totalNumValidatorFailure: 1635,
                  totalNumValidatorIgnoredSignatures: 4192,
                  shardId: 2,
                  validatorStatus: 'eligible',
                },
                '0059c1e7b6e78e081c659e3c5c5b1802f825583e819117674940f5826a5648e11d2f234e0677b18d83de403b8f15fd1053dc2b724d996210c9d6bd993322eaf4cb42756f19e34f93f62be31d685889727cba63365997ab7a2f0ddc9045418384': {
                  tempRating: 100,
                  numLeaderSuccess: 0,
                  numLeaderFailure: 0,
                  numValidatorSuccess: 24,
                  numValidatorFailure: 0,
                  numValidatorIgnoredSignatures: 1,
                  rating: 100,
                  ratingModifier: 1.2,
                  totalNumLeaderSuccess: 5801,
                  totalNumLeaderFailure: 4,
                  totalNumValidatorSuccess: 945386,
                  totalNumValidatorFailure: 1383,
                  totalNumValidatorIgnoredSignatures: 7644,
                  shardId: 0,
                  validatorStatus: 'eligible',
                },
              },
            },
          },
        };
      if (url.includes('config'))
        return {
          data: {
            data: {
              config: {
                erd_chain_id: '1',
                erd_denomination: 18,
                erd_gas_per_data_byte: 1500,
                erd_gas_price_modifier: '1',
                erd_latest_tag_software_version: 'v1.1.26.0',
                erd_meta_consensus_group_size: 400,
                erd_min_gas_limit: 50000,
                erd_min_gas_price: 1000000000,
                erd_min_transaction_version: 1,
                erd_num_metachain_nodes: 400,
                erd_num_nodes_in_shard: 400,
                erd_num_shards_without_meta: 3,
                erd_rewards_top_up_gradient_point: '3000000000000000000000000',
                erd_round_duration: 6000,
                erd_shard_consensus_group_size: 63,
                erd_start_time: 1596117600,
                erd_top_up_factor: '0.25',
              },
            },
          },
        };
    }),
  };
});

jest.mock('../../helpers/getChunks', () => {
  return jest.fn(() => []);
});

describe('Test getNodes helper', () => {
  test('Test node found in heartbeats', async () => {
    const helperResponse = await getNodes();
    const foundNode = {
      issues: [],
      publicKey:
        '002576a00bedd8d3dd6f6e5ec74ed0a31a401d48fd5a00e710962c65a97acb156033daaec449e9ec39d5276f0bc2d50c7df8bef75167f2368424971801a5add4ac671d67cfdf4a5f5e055acce419d20ff3e2751d252a44001a7c1c41c89f3b8f',
      versionNumber: 'v1.1.26.0',
      nodeName: 'Elrond-Bootnode-29-1',
      totalUpTimeSec: 9934273,
      totalUpTime: 99.99,
      totalDownTime: 0.01,
      totalDownTimeSec: 808,
      peerType: 'eligible',
      status: 'online',
      nonce: 3023924,
      numInstances: 1,
      nodeType: 'validator',
      tempRating: 100,
      rating: 100,
      ratingModifier: 1.2,
      shard: 2,
    };
    const validatorNode = {
      issues: ['outdatedVersion'],
      tempRating: 100,
      rating: 100,
      ratingModifier: 1.2,
      shard: 0,
      status: 'offline',
    };

    expect(helperResponse[0]).toMatchObject(foundNode);
    expect(helperResponse[1]).toMatchObject(validatorNode);
  });
});
