const { getNodes, response, setForwardedHeaders } = require('./helpers');

const {
  cache: { moderate },
} = require(`./configs/${process.env.CONFIG}`);

let globalNodes;
let globalTimestamp;

exports.handler = async ({
  requestContext: { identity: { userAgent = undefined, caller = undefined } = {} } = {},
  pathParameters,
  queryStringParameters,
}) => {
  await setForwardedHeaders({ ['user-agent']: userAgent, ['x-forwarded-for']: caller });

  try {
    const { hash } = pathParameters || {};
    const {
      from = 0,
      size = 25,
      search,
      online,
      type,
      status,
      shard,
      issues,
      identity,
      provider,
      owner,
      sort,
      order = 'asc',
    } = queryStringParameters || {};

    let results;
    let nodes;

    // attempt to not reload the nodes sooner than once every 30 seconds
    if (globalNodes && globalTimestamp && globalTimestamp + 30 < Math.floor(Date.now() / 1000)) {
      // console.log('global cache');
      nodes = globalNodes;
    } else {
      // console.log('new fetch', globalTimestamp, Math.floor(Date.now() / 1000));
      nodes = await getNodes();
      globalNodes = nodes;
      globalTimestamp = Math.floor(Date.now() / 1000);
    }

    if (hash && !['count', 'versions'].includes(hash)) {
      const node = nodes.find(({ bls }) => bls === hash);

      results = node ? { data: node } : { status: 404 };
    } else if (hash && hash === 'versions') {
      const data = nodes
        .filter(({ type }) => type === 'validator')
        .reduce((accumulator, item) => {
          if (item.version) {
            if (!accumulator[item.version]) {
              accumulator[item.version] = 1;
            } else {
              accumulator[item.version] += 1;
            }
          }

          return accumulator;
        }, {});

      const sum = Object.keys(data).reduce((accumulator, item) => {
        return accumulator + data[item];
      }, 0);

      Object.keys(data).forEach((key) => {
        data[key] = parseFloat((data[key] / sum).toFixed(2));
      });

      results = { data };
    } else {
      const data = nodes.filter((node) => {
        if (search) {
          const nodeMatches = node.bls.toLowerCase().includes(search.toLowerCase());
          const nameMatches = node.name && node.name.toLowerCase().includes(search.toLowerCase());
          const versionMatches =
            node.version && node.version.toLowerCase().includes(search.toLowerCase());

          if (!nodeMatches && !nameMatches && !versionMatches) {
            return false;
          }
        }

        if (online && String(node.online) !== online) {
          return false;
        }

        if (type && node.type !== type) {
          return false;
        }

        if (status && node.status !== status) {
          return false;
        }

        if (
          shard !== undefined &&
          (typeof node.shard === 'undefined' || node.shard.toString() !== shard)
        ) {
          return false;
        }

        if (issues && (!node.issues || !node.issues.length > 0)) {
          return false;
        }

        if (identity && node.identity !== identity) {
          return false;
        }

        if (provider && node.provider !== provider) {
          return false;
        }

        if (owner && node.owner !== owner) {
          return false;
        }

        return true;
      });

      if (
        sort &&
        [
          'name',
          'version',
          'uptime',
          'tempRating',
          'leaderSuccess',
          'leaderFailure',
          'validatorSuccess',
          'validatorFailure',
          'validatorIgnoredSignatures',
        ].includes(sort)
      ) {
        data.sort((a, b) => {
          let asort = a[sort];
          let bsort = b[sort];

          if (asort && typeof asort === 'string') {
            asort = asort.toLowerCase();
          }

          if (bsort && typeof bsort === 'string') {
            bsort = bsort.toLowerCase();
          }

          return asort > bsort ? 1 : bsort > asort ? -1 : 0;
        });

        if (order === 'desc') {
          data.reverse();
        }
      }

      if (hash && hash === 'count') {
        results = { data: data.length };
      } else {
        const endIndex = parseInt(from) + parseInt(size);
        results = { data: data.slice(parseInt(from), endIndex) };
      }
    }

    return response({ ...results, cache: moderate });
  } catch (error) {
    console.error('nodes error', error);
    return response({ status: 503 });
  }
};
