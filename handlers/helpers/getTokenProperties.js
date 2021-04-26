const vmQuery = require('./vmQuery');
const bech32 = require('./bech32');

const { esdtContract } = require(`../configs/${process.env.CONFIG}`);

const canBool = (string) => {
  return string.split('-').pop() === 'true';
};

const getTokenProperties = async (token) => {
  const arg = Buffer.from(token, 'utf8').toString('hex');

  const tokenPropertiesEncoded = await vmQuery({
    contract: esdtContract,
    func: 'getTokenProperties',
    args: [arg],
  });

  const tokenProperties = tokenPropertiesEncoded.map((encoded, index) =>
    Buffer.from(encoded, 'base64').toString(index === 2 ? 'hex' : undefined)
  );

  const [
    name,
    type,
    owner,
    minted,
    burnt,
    decimals,
    isPaused,
    canUpgrade,
    canMint,
    canBurn,
    canChangeOwner,
    canPause,
    canFreeze,
    canWipe,
    canAddSpecialRoles,
    canTransferNFTCreateRole,
    NFTCreateStopped,
    wiped,
  ] = tokenProperties;

  const tokenProps = {
    token,
    name,
    type,
    owner: bech32.encode(owner),
    minted,
    burnt,
    decimals: parseInt(decimals.split('-').pop()),
    isPaused: canBool(isPaused),
    canUpgrade: canBool(canUpgrade),
    canMint: canBool(canMint),
    canBurn: canBool(canBurn),
    canChangeOwner: canBool(canChangeOwner),
    canPause: canBool(canPause),
    canFreeze: canBool(canFreeze),
    canWipe: canBool(canWipe),
    canAddSpecialRoles: canBool(canAddSpecialRoles),
    canTransferNFTCreateRole: canBool(canTransferNFTCreateRole),
    NFTCreateStopped: canBool(NFTCreateStopped),
    wiped: wiped.split('-').pop(),
  };

  if (type === 'FungibleESDT') {
    delete tokenProps.canAddSpecialRoles;
    delete tokenProps.canTransferNFTCreateRole;
    delete tokenProps.NFTCreateStopped;
    delete tokenProps.wiped;
  }

  return tokenProps;
};

module.exports = getTokenProperties;
