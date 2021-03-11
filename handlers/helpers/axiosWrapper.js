const Axios = require('axios');

let axios = Axios.create();

// Set the user-agent and x-forwarded-for  for any request
const setForwardedHeaders = ({
  ['user-agent']: userAgent,
  ['x-forwarded-for']: xForwardedFor = null,
}) => {
  axios.interceptors.request.use((request) => {
    request.headers['user-agent'] = userAgent;
    request.headers['x-forwarded-for'] = xForwardedFor;

    return request;
  });
};

module.exports = {
  axios,
  setForwardedHeaders,
};
