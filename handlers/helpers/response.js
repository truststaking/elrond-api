const { statuses } = require(`../configs/${process.env.CONFIG}`);

const clean = (obj) => {
  if (typeof obj === 'number') return obj;
  if (Array.isArray(obj)) {
    return obj.map((v) => (v && typeof v === 'object' ? clean(v) : v)).filter((v) => !(v == null));
  } else {
    return Object.entries(obj)
      .map(([k, v]) => [k, v && typeof v === 'object' ? clean(v) : v])
      .reduce(
        (a, [k, v]) =>
          v === null ||
          v === '' ||
          // v === '<nil>' ||
          (v instanceof Object && Object.keys(v).length == 0)
            ? a
            : ((a[k] = v), a),
        {}
      );
  }
};

const sort = (key, value) => {
  if (value instanceof Object && !(value instanceof Array)) {
    return Object.keys(value)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = value[key];
        return sorted;
      }, {});
  } else {
    return value;
  }
};

const transformItem = (item, fields) => {
  Object.keys(item).forEach((key) => {
    if (!fields.includes(key)) {
      delete item[key];
    }
  });

  return item;
};

const response = ({ status = 200, data, fields, headers = {}, extract = false }) => {
  if (!data && statuses[status]) {
    if (status >= 400) {
      data = {
        error: statuses[status],
      };
    } else {
      data = {
        message: statuses[status],
      };
    }
  }

  if (fields) {
    if (Array.isArray(data)) {
      data.map((item) => transformItem(item, fields));
    } else data = transformItem(data, fields);
  }

  let body =
    Array.isArray(data) && data.length === 0
      ? JSON.stringify([])
      : JSON.stringify(clean(data), sort);

  if (extract && typeof data[extract] !== 'undefined') {
    body = data[extract];
  }

  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...headers,
    },
    body: JSON.parse(body),
  };
};

module.exports = response;
