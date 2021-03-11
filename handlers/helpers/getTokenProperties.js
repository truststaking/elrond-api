const vmQuery = require('./vmQuery');
const bech32 = require('./bech32');

const { esdtContract } = require('../configs/config');

const canBool = (string) => {
  return string.split('-').pop() === 'true';
};

const getTokenProperties = async (tokenIdentifier) => {
  const arg = Buffer.from(tokenIdentifier, 'utf8').toString('hex');

  const tokenPropertiesEncoded = await vmQuery({
    contract: esdtContract,
    func: 'getTokenProperties',
    args: [arg],
  });

  const tokenProperties = tokenPropertiesEncoded.map((encoded, index) =>
    Buffer.from(encoded, 'base64').toString(index === 1 ? 'hex' : undefined)
  );

  const [
    tokenName,
    ownerAddress,
    mintedValue,
    burntValue,
    numDecimals,
    isPaused,
    canUpgrade,
    canMint,
    canBurn,
    canChangeOwner,
    canPause,
    canFreeze,
    canWipe,
  ] = tokenProperties;

  return {
    tokenIdentifier,
    tokenName,
    ownerAddress: bech32.encode(ownerAddress),
    mintedValue,
    burntValue,
    numDecimals: parseInt(numDecimals.split('-').pop()),
    isPaused: canBool(isPaused),
    canUpgrade: canBool(canUpgrade),
    canMint: canBool(canMint),
    canBurn: canBool(canBurn),
    canChangeOwner: canBool(canChangeOwner),
    canPause: canBool(canPause),
    canFreeze: canBool(canFreeze),
    canWipe: canBool(canWipe),
  };
};

module.exports = getTokenProperties;
