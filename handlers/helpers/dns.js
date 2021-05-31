const crypto = require('crypto-js');
const { dnsContracts } = require('../configs');

const normalizeName = (name) => {
  const prefix = '@';
  const suffix = '.elrond';

  name = name.toLowerCase().replace(/\W/g, '');

  if (name.startsWith(prefix)) {
    name = name.substring(prefix.length);
  }

  if (!name.endsWith(suffix)) {
    name += suffix;
  }

  return name;
};

const getContract = (username) => {
  const normalized = normalizeName(username);

  const hash = crypto.SHA3(normalized, { outputLength: 256 }).toString(crypto.enc.Hex);

  const buffer = Buffer.from(hash, 'hex');
  const last = buffer[buffer.length - 1];

  return dnsContracts[last];
};

const encodeName = (username) => {
  const normalized = normalizeName(username);
  return Buffer.from(normalized).toString('hex');
};

module.exports = {
  normalizeName,
  getContract,
  encodeName,
};
