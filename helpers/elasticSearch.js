const axios = require('axios');
const { elasticUrl } = require('../config');

const buildParams = ({ query, sort = false, order = false }) => {
  return { query: { match_all: {} } };
};

const formatItem = ({ key, document, fields }) => {
  const { _id, _source } = document;
  const item = {};
  item[key] = _id;
  return { ...item, ..._source };
};

const getList = async ({ collection, key, query, sort, order }) => {
  // console.log(collection, key, query, sort, order);
  const url = `${elasticUrl()}/${collection}/_search`;
  const params = buildParams({ query, sort, order });

  const {
    data: {
      hits: { hits: documents },
    },
  } = await axios.post(url, params);

  return documents.map((document) => formatItem({ key, document }));
};

const getItem = async ({ collection, key, hash, fields }) => {
  // console.log(collection, key, hash, fields);
  const url = `${elasticUrl()}/${collection}/_doc/${hash}`;

  const { data: document } = await axios.get(url);

  return formatItem({ key, document, fields });
};

const getCount = async ({ collection, query }) => {
  // console.log(collection, query);
  const url = `${elasticUrl()}/${collection}/_count`;
  const params = buildParams(query);

  const {
    data: { count },
  } = await axios.post(url, params);

  return count;
};

module.exports = {
  getList,
  getItem,
  getCount,
};
