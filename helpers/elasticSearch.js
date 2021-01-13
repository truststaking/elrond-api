const axios = require('axios');
const { elasticUrl } = require('../config');

const buildQuery = (query = {}) => {
  delete query.from;
  delete query.size;

  if (Object.keys(query).length) {
    const must = Object.keys(query).map((key) => {
      const match = {};
      match[key] = query[key];

      return { match };
    });

    query = { bool: { must } };
  } else {
    query = { match_all: {} };
  }

  return query;
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

const formatItem = ({ document, key }) => {
  const { _id, _source } = document;
  const item = {};
  item[key] = _id;

  return { ...item, ..._source };
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
  } = await axios.post(url, { query, sort, from, size });

  return documents.map((document) => formatItem({ document, key }));
};

const getItem = async ({ collection, key, hash }) => {
  const url = `${elasticUrl()}/${collection}/_doc/${hash}`;
  const { data: document } = await axios.get(url);

  return formatItem({ document, key });
};

const getCount = async ({ collection, query }) => {
  const url = `${elasticUrl()}/${collection}/_count`;
  query = buildQuery(query);

  const {
    data: { count },
  } = await axios.post(url, { query });

  return count;
};

module.exports = {
  getList,
  getItem,
  getCount,
};
