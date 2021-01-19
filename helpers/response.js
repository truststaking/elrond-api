const statuses = {
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

const clean = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => (v && typeof v === 'object' ? clean(v) : v)).filter((v) => !(v == null));
  } else {
    return Object.entries(obj)
      .map(([k, v]) => [k, v && typeof v === 'object' ? clean(v) : v])
      .reduce(
        (a, [k, v]) =>
          v == null ||
          v == '' ||
          v == '<nil>' ||
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

const response = ({ status = 200, data, headers = {}, extract = false }) => {
  if (!data && statuses[status]) {
    data = {
      message: statuses[status],
    };
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
      'Constent-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'x-wallet-version,x-access',
      ...headers,
    },
    body: JSON.parse(body),
  };
};

module.exports = response;
