const { getNodes, response, getProfile, batchProcess } = require('./helpers');

let globalNodes;
let globalTimestamp;

exports.handler = async ({ pathParameters }) => {
  try {
    const { key } = pathParameters || {};

    let nodes;

    // attempt to not reload the nodes sooner than once every 30 seconds
    if (globalNodes && globalTimestamp && globalTimestamp + 30 < Math.floor(Date.now() / 1000)) {
      nodes = globalNodes;
    } else {
      nodes = await getNodes();
      globalNodes = nodes;
      globalTimestamp = Math.floor(Date.now() / 1000);
    }

    let keys = [
      ...new Set(nodes.filter(({ identity }) => !!identity).map(({ identity }) => identity)),
    ];

    let identities = await batchProcess({ payload: keys, handler: getProfile, ttl: 1800 }); // 30m

    let totalStake = BigInt(0);
    let totalTopUp = BigInt(0);

    nodes.forEach((node) => {
      const found = identities.find(({ identity }) => identity === node.identity);

      if (found && node.identity && !!node.identity) {
        if (!found.nodes) {
          found.nodes = [];
        }

        found.nodes.push(node);
      } else if (!key) {
        identities.push({ name: node.bls, nodes: [node] });
      }

      if (node.type == 'validator') {
        if (node.stake) {
          totalStake += BigInt(node.stake);
        }

        if (node.topUp) {
          totalTopUp += BigInt(node.topUp);
        }
      }
    });

    const totalLocked = totalStake + totalTopUp;

    identities.forEach((identity) => {
      if (identity.nodes && identity.nodes.length) {
        const score = identity.nodes
          .map(({ ratingModifier }) => ratingModifier)
          .reduce((acumulator, current) => acumulator + current);

        const stake = identity.nodes
          .map(({ stake }) => (stake ? stake : '0'))
          .reduce((acumulator, current) => acumulator + BigInt(current), BigInt(0));

        const topUp = identity.nodes
          .map(({ topUp }) => (topUp ? topUp : '0'))
          .reduce((acumulator, current) => acumulator + BigInt(current), BigInt(0));

        const locked = stake + topUp;

        const stakePercent = (locked * BigInt(10000)) / totalLocked;

        const providers = identity.nodes
          .map(({ provider }) => provider)
          .filter((provider) => !!provider);

        const distribution = identity.nodes.reduce((accumulator, current) => {
          const stake = current.stake ? BigInt(current.stake) : BigInt(0);
          const topUp = current.topUp ? BigInt(current.topUp) : BigInt(0);

          if (current.provider) {
            if (!accumulator[current.provider]) {
              accumulator[current.provider] = BigInt(0);
            }

            accumulator[current.provider] += stake + topUp;
          } else {
            if (!accumulator.direct) {
              accumulator.direct = BigInt(0);
            }

            accumulator.direct += stake + topUp;
          }

          return accumulator;
        }, {});

        Object.keys(distribution).forEach((key) => {
          if (locked) {
            distribution[key] = Number((BigInt(100) * distribution[key]) / locked) / 100;
          } else {
            distribution[key] = null;
          }
        });

        if (distribution && Object.keys(distribution).length > 1) {
          const first = Object.keys(distribution)[0];
          const rest = Object.keys(distribution)
            .slice(1)
            .reduce((accumulator, current) => (accumulator += distribution[current]), 0);
          distribution[first] = parseFloat((1 - rest).toFixed(2));
        }

        identity.score = Math.floor(score * 100);
        identity.validators = identity.nodes.filter(
          ({ type, status }) => type === 'validator' && status !== 'inactive'
        ).length;
        identity.stake = stake.toString();
        identity.topUp = topUp.toString();
        identity.locked = locked.toString();
        identity.distribution = distribution;
        identity.providers = [...new Set(providers)];
        identity.stakePercent = parseFloat((Number(stakePercent) / 100).toFixed(2));
        identity.sort =
          identity.locked && identity.locked !== '0' ? parseInt(identity.locked.slice(0, -18)) : 0;
      }
    });

    identities.sort((a, b) => {
      return b.sort - a.sort;
    });

    identities.forEach((identity) => {
      delete identity.nodes;
      delete identity.sort;
    });

    if (key) {
      const identity = identities.find(({ identity }) => identity === key);

      if (identity) {
        return response({ data: identity });
      } else {
        return response({ status: 404 });
      }
    }

    identities = identities.filter(({ locked }) => locked !== '0');

    identities.forEach((identity, index) => {
      identity.rank = index + 1;
    });

    return response({ data: identities });
  } catch (error) {
    console.error('indentities error', error);
    return response({ status: 503 });
  }
};
