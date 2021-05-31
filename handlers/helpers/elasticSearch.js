const axios = require('axios');

const { elasticUrl, axiosConfig } = require(`../configs/${process.env.CONFIG}`);

const buildQuery = (query = {}) => {
  delete query.from;
  delete query.size;

  const { before, after } = query;
  delete query.before;
  delete query.after;
  const range = buildRange({ before, after });

  const { condition } = query;
  delete query.condition;

  if (Object.keys(query).length) {
    const params = Object.keys(query).map((key) => {
      const match = {};
      match[key] = query[key];

      return { match };
    });

    query = { bool: {} };
    query.bool[condition && condition === 'should' ? 'should' : 'must'] = params;
    if (range) {
      query.bool.filter = { range };
      if (condition === 'should') query.bool.minimum_should_match = 1;
    }
  } else if (Object.keys(range.timestamp).length != 0) {
    query.range = range;
  } else {
    query = { match_all: {} };
  }

  return query;
};

const getAuthHeaders = () => {
  const token = Buffer.from(
    `${process.env.PrivateElasticUsername}:${process.env.PrivateElasticPassword}`
  ).toString('base64');
  return 'Basic ' + token;
};

const isPrivate = () => {
  if (process.env.PrivateElastic) {
    return process.env.PrivateElastic;
  } else {
    return false;
  }
};

const buildSort = (sort = {}) => {
  sort = Object.keys(sort).map((key) => {
    const obj = {};
    obj[key] = {};
    obj[key].order = sort[key];

    return obj;
  });

  return sort;
};

const buildRange = (range = {}) => {
  let obj = {};
  obj.timestamp = {};
  Object.keys(range).map((key) => {
    if (key == 'before' && range[key] != undefined) {
      obj.timestamp.lte = range[key];
    }
    if (key == 'after' && range[key] != undefined) {
      obj.timestamp.gte = range[key];
    }
  });
  return obj;
};

const formatItem = ({ document, key }) => {
  const { _id, _source } = document;
  const item = {};
  item[key] = _id;

  return { ...item, ..._source };
};

const axiosRequestWrapper = async ({ method, URL, data, config = {} }) => {
  if (isPrivate()) {
    config = { ...config, headers: { ...config.headers, Authorization: getAuthHeaders() } };
  }

  if (method === 'POST') {
    return await axios.post(URL, { ...data }, { ...config });
  } else if (method === 'GET') {
    return await axios.get(URL, { ...config });
  }
};

const getList = async ({ collection, key, query, sort }) => {
  const url = `${elasticUrl()}/${collection}/_search`;
  const { from = 0, size = 25 } = query;

  query = buildQuery(query);
  sort = buildSort(sort);
  const {
    data: {
      hits: { hits: documents },
    },
  } = await axiosRequestWrapper({
    method: 'POST',
    URL: url,
    data: { query, sort, from, size },
    config: axiosConfig,
  });

  return documents.map((document) => formatItem({ document, key }));
};

const getItem = async ({ collection, key, hash }) => {
  const url = `${elasticUrl()}/${collection}/_doc/${hash}`;
  const { data: document } = await axiosRequestWrapper({
    method: 'GET',
    URL: url,
    config: axiosConfig,
  });

  return formatItem({ document, key });
};

const getCount = async ({ collection, query }) => {
  const url = `${elasticUrl()}/${collection}/_count`;
  query = buildQuery(query);

  const {
    data: { count },
  } = await axiosRequestWrapper({ method: 'POST', URL: url, data: { query }, config: axiosConfig });

  return count;
};

const publicKeysCache = {};

const getBlses = async ({ shard, epoch }) => {
  const key = `${shard}_${epoch}`;

  if (publicKeysCache[key]) {
    return publicKeysCache[key];
  }

  const url = `${elasticUrl()}/validators/_doc/${key}`;

  const {
    data: {
      _source: { publicKeys },
    },
  } = await axiosRequestWrapper({ method: 'GET', URL: url, config: axiosConfig });

  publicKeysCache[key] = publicKeys;

  return publicKeys;
};

const getBlsIndex = async ({ bls, shard, epoch }) => {
  const url = `${elasticUrl()}/validators/_doc/${shard}_${epoch}`;

  const {
    data: {
      _source: { publicKeys },
    },
  } = await axiosRequestWrapper({ method: 'GET', URL: url, config: axiosConfig });

  const index = publicKeys.indexOf(bls);

  if (index !== -1) {
    return index;
  }

  return false;
};

module.exports = {
  getList,
  getItem,
  getCount,
  getBlses,
  getBlsIndex,
};
