const bech32 = require('bech32');

const encode = (publicKey) => {
  const words = bech32.toWords(Buffer.from(publicKey, 'hex'));
  return bech32.encode('erd', words);
};

const decode = (address) => {
  const decoded = bech32.decode(address, 256);
  return Buffer.from(bech32.fromWords(decoded.words)).toString('hex');
};

module.exports = {
  encode,
  decode,
};
