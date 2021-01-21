const { getNodes, response } = require('../helpers');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const { hash } = pathParameters;
    const {
      from = 0,
      size = 25,
      search,
      status,
      peerType,
      nodeType,
      shard,
      issues,
      identity,
      sort,
      order = 'asc',
    } = queryStringParameters;

    let results;
    const nodes = await getNodes();

    if (hash && hash !== 'count') {
      const node = nodes.find((node) => node.publicKey === hash);

      results = node ? { data: node } : { status: 404 };
    } else {
      const data = nodes.filter((node) => {
        if (search) {
          const pubKeyMatches = node.publicKey.toLowerCase().includes(search.toLowerCase());
          const nameMatches =
            node.nodeName && node.nodeName.toLowerCase().includes(search.toLowerCase());
          const versionMatches = node.versionNumber.toLowerCase().includes(search.toLowerCase());

          if (!pubKeyMatches && !nameMatches && !versionMatches) {
            return false;
          }
        }

        if (status && node.status !== status) {
          return false;
        }

        if (peerType && node.peerType !== peerType) {
          return false;
        }

        if (nodeType && node.nodeType !== nodeType) {
          return false;
        }

        if (
          shard !== undefined &&
          (typeof node.shard === 'undefined' || node.shard.toString() !== shard)
        ) {
          return false;
        }

        if (issues && !node.issues.length > 0) {
          return false;
        }

        if (identity && node.identity !== identity) {
          return false;
        }

        return true;
      });

      if (sort && ['nodeName', 'versionNumber', 'totalUpTime', 'tempRating'].includes(sort)) {
        data.sort((a, b) => (a[sort] > b[sort] ? 1 : b[sort] > a[sort] ? -1 : 0));

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

    return response(results);
  } catch (error) {
    console.error('nodes error', error);
    return response({ status: 503 });
  }
};
