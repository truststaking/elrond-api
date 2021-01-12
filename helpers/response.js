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

const empty = (value) => {
  if (Array.isArray(value) && value.length !== 0) {
    value = value.filter((value) => value !== '' && value !== null);
  }

  if (typeof value === 'object' && Object.keys(value).length !== 0) {
    for (const prop in value) {
      if ([null, ''].includes(value[prop])) {
        delete value[prop];
      }
    }
  }

  return (
    [null, ''].includes(value) ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
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
      : JSON.stringify(data, (key, value) => (empty(value) ? undefined : value));

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
