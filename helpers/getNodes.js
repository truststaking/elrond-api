const axios = require('axios');
const { getCache, putCache, batchGetCache, batchPutCache } = require('./cache');
const { gatewayUrl } = require('../config');
const getChunks = require('./getChunks');
const confirmNodeIdentity = require('./confirmNodeIdentity');

const nodeIssues = (node, versionNumber) => {
  const nodeIssues = [];

  if (node.totalUpTimeSec === 0) {
    nodeIssues.push('offlineSinceGenesis'); // Offline since genesis
  }

  if (versionNumber !== node.versionNumber) {
    nodeIssues.push('outdatedVersion'); // Outdated client version
  }

  if (node.receivedShardID !== node.computedShardID && node.peerType === 'eligible') {
    nodeIssues.push('shuffledOut'); // Shuffled out restart failed
  }

  return nodeIssues;
};

const getNodes = async (args) => {
  let skipCache = false;

  if (args && args.skipCache) {
    skipCache = args.skipCache;
  }

  const key = 'nodes';
  let data = await getCache({ key });

  if (data && !skipCache) {
    return data;
  } else {
    data = [];
  }

  const [
    {
      data: {
        data: { heartbeats },
      },
    },
    {
      data: {
        data: { statistics },
      },
    },
    {
      data: {
        data: { config },
      },
    },
  ] = await Promise.all([
    axios.get(`${gatewayUrl()}/node/heartbeatstatus`),
    axios.get(`${gatewayUrl()}/validator/statistics`),
    axios.get(`${gatewayUrl()}/network/config`),
  ]);

  const publicKeys = Object.keys(statistics);

  heartbeats.forEach(({ publicKey }) => {
    if (!publicKeys.includes(publicKey)) {
      publicKeys.push(publicKey);
    }
  });

  for (let i in publicKeys) {
    let publicKey = publicKeys[i];

    let node = {};
    const found = heartbeats.find((element) => element.publicKey === publicKey);

    if (statistics[publicKey]) {
      node = statistics[publicKey];
    }

    if (found) {
      node = { ...node, ...found };
    }

    let {
      nodeDisplayName: nodeName,
      versionNumber,
      identity,
      tempRating,
      rating,
      ratingModifier,
      totalUpTimeSec,
      totalDownTimeSec,
      shardId: shard,
      receivedShardID,
      computedShardID,
      peerType,
      isActive,
      validatorStatus,
    } = node;

    if (shard === undefined) {
      if (peerType === 'observer') {
        shard = receivedShardID;
      } else {
        shard = computedShardID;
      }
    }

    let nodeType;

    peerType = validatorStatus ? validatorStatus : peerType;

    if (peerType === 'observer') {
      peerType = undefined;
      nodeType = 'observer';
    } else {
      nodeType = 'validator';
    }

    const resultNode = {
      publicKey,
      nodeName,
      versionNumber: versionNumber ? versionNumber.split('-')[0] : '',
      identity: identity && identity !== '' ? identity.toLowerCase() : identity,
      rating: parseFloat(parseFloat(rating).toFixed(2)),
      tempRating: parseFloat(parseFloat(tempRating).toFixed(2)),
      ratingModifier: ratingModifier ? ratingModifier : 0,
      totalUpTimeSec,
      totalDownTimeSec,
      shard,
      nodeType,
      peerType: typeof peerType === 'undefined' ? undefined : peerType.split(' ')[0], // solution for: eligible (leaving)
      status: isActive ? 'online' : 'offline',
    };

    if (resultNode.totalUpTimeSec === 0 && node.totalDownTimeSec === 0) {
      resultNode.totalUpTime = node.status === 'online' ? 100 : 0;
      resultNode.totalDownTime = node.status === 'online' ? 0 : 100;
    } else {
      const uptime =
        (resultNode.totalUpTimeSec * 100) /
        (resultNode.totalUpTimeSec + resultNode.totalDownTimeSec);
      resultNode.totalUpTime = parseFloat(uptime.toFixed(2));
      resultNode.totalDownTime = parseFloat((100 - uptime).toFixed(2));
    }

    if (resultNode.peerType === 'queued' || resultNode.peerType === 'jailed') {
      delete resultNode.shard;
    }

    resultNode.issues = nodeIssues(resultNode, config.erd_latest_tag_software_version);

    data.push(resultNode);
  }

  let chunks = getChunks(
    data
      .filter(({ identity }) => !!identity)
      .map(({ identity, publicKey }) => {
        const key = `${identity}:${publicKey}`;
        return { identity, publicKey, key };
      }),
    100
  );

  const cached = await Promise.all(
    chunks.map((chunk) => {
      const keys = chunk.map(({ key }) => key);
      return batchGetCache({ keys });
    })
  );

  chunks.forEach((chunk, i) => {
    chunk.forEach(({ publicKey }, j) => {
      const node = data.find((node) => node.publicKey === publicKey);
      node.confirmed = cached[i][j];
    });
  });

  chunks = getChunks(
    data
      .filter(({ identity, confirmed }) => !!identity && confirmed === null)
      .map(({ identity, publicKey }) => {
        return { identity, publicKey };
      })
  );

  for (const chunk of chunks) {
    const checks = await Promise.all(
      chunk.map(({ identity, publicKey }) => confirmNodeIdentity({ identity, publicKey }))
    );

    const cache = { confirmed: { keys: [], values: [] }, unconfirmed: { keys: [], values: [] } };
    checks.forEach((check, index) => {
      const { identity, publicKey } = chunk[index];

      const node = data.find((node) => node.publicKey === publicKey);
      node.confirmed = check;

      cache[check ? 'confirmed' : 'unconfirmed'].keys.push(`${identity}:${publicKey}`);
      cache[check ? 'confirmed' : 'unconfirmed'].values.push(check);
    });

    if (cache.confirmed.keys.length) {
      const { keys, values } = cache.confirmed;
      await batchPutCache({ keys, values, ttl: 21600 }); // 6 hours
    }

    if (cache.unconfirmed.keys.length) {
      const { keys, values } = cache.unconfirmed;
      await batchPutCache({ keys, values, ttl: 300 }); // 5 minutes
    }
  }

  data.forEach((node) => {
    if (!node.confirmed) {
      delete node.identity;
    }
    delete node.confirmed;
  });

  await putCache({ key, value: data, ttl: 70 });

  return data;
};

module.exports = getNodes;
