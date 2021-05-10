const reverseGeocoding = require('./reverseGeocoding');
const batchProcess = require('./batchProcess');

const getLocations = async (payload) => {
  return await batchProcess({
    payload,
    handler: reverseGeocoding,
    ttl: 604800,
  }); // 1w
};

module.exports = getLocations;
