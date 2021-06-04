const Phase3 = {
  timestamp: 1617633000,
  epoch: 249,
};

const getTimestampByEpoch = (epoch) => {
  var diff;
  if (epoch >= Phase3.epoch) {
    diff = epoch - Phase3.epoch;
    return diff * (60 * 60 * 24) + Phase3.timestamp;
  } else {
    diff = Phase3.epoch - epoch;
    return Phase3.timestamp - diff * (60 * 60 * 24);
  }
};

const getEpoch = (timestamp) => {
  var diff;
  if (timestamp >= Phase3.timestamp) {
  diff = timestamp - Phase3.timestamp;
  return Phase3.epoch + Math.floor(diff / (60 * 60 * 24));
  } else {
  diff = Phase3.timestamp - timestamp;
  return Phase3.epoch - Math.floor(diff / (60 * 60 * 24));
  }
};

module.exports = {Phase3, getTimestampByEpoch, getEpoch};