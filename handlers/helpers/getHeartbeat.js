const axios = require('axios');

const { gatewayUrl, axiosConfig } = require(`../configs/${process.env.CONFIG}`);

const getIssues = (node, version) => {
  const issues = [];

  if (node.totalUpTimeSec === 0) {
    issues.push('offlineSinceGenesis'); // Offline since genesis
  }

  if (version !== node.version) {
    issues.push('versionMismatch'); // Outdated client version
  }

  if (node.receivedShardID !== node.computedShardID && node.peerType === 'eligible') {
    issues.push('shuffledOut'); // Shuffled out restart failed
  }

  return issues;
};

const getHeartbeat = async () => {
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
    axios.get(`${gatewayUrl()}/node/heartbeatstatus`, axiosConfig),
    axios.get(`${gatewayUrl()}/validator/statistics`, axiosConfig),
    axios.get(`${gatewayUrl()}/network/config`, axiosConfig),
  ]);

  const value = [];

  const blses = [
    ...new Set([...Object.keys(statistics), ...heartbeats.map(({ publicKey }) => publicKey)]),
  ];

  for (const bls of blses) {
    const heartbeat = heartbeats.find((beat) => beat.publicKey === bls) || {};
    const statistic = statistics[bls] || {};

    const item = { ...heartbeat, ...statistic };

    let {
      nodeDisplayName: name,
      versionNumber: version,
      identity,
      tempRating,
      rating,
      ratingModifier,
      totalUpTimeSec: uptimeSec,
      totalDownTimeSec: downtimeSec,
      shardId: shard,
      receivedShardID,
      computedShardID,
      peerType,
      isActive,
      validatorStatus,
      nonce,
      numInstances: instances,
    } = item;

    if (shard === undefined) {
      if (peerType === 'observer') {
        shard = receivedShardID;
      } else {
        shard = computedShardID;
      }
    }

    let type;
    let status = validatorStatus ? validatorStatus : peerType;

    if (status === 'observer') {
      status = undefined;
      type = 'observer';
    } else {
      type = 'validator';
      if (status && status.includes('leaving')) {
        status = 'leaving';
      }
    }

    const result = {
      bls,
      name,
      version: version ? version.split('-')[0].split('/')[0] : '',
      identity: identity && identity !== '' ? identity.toLowerCase() : identity,
      rating: parseFloat(parseFloat(rating).toFixed(2)),
      tempRating: parseFloat(parseFloat(tempRating).toFixed(2)),
      ratingModifier: ratingModifier ? ratingModifier : 0,
      uptimeSec,
      downtimeSec,
      shard,
      type,
      status,
      online: isActive ? true : false,
      nonce,
      instances,
    };

    if (result.uptimeSec === 0 && item.downtimeSec === 0) {
      result.uptime = item.online ? 100 : 0;
      result.downtime = item.online ? 0 : 100;
    } else {
      const uptime = (result.uptimeSec * 100) / (result.uptimeSec + result.downtimeSec);
      result.uptime = parseFloat(uptime.toFixed(2));
      result.downtime = parseFloat((100 - uptime).toFixed(2));
    }

    if (['queued', 'jailed'].includes(result.peerType)) {
      delete result.shard;
    }

    result.issues = getIssues(result, config.erd_latest_tag_software_version);

    value.push(result);
  }

  return value;
};

module.exports = getHeartbeat;
