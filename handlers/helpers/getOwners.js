const bech32 = require('./bech32');
const vmQuery = require('./vmQuery');

const { auctionContract, stakingContract } = require('../configs/config');
const e = require('express');

const getOwner = async (publicKey) => {
  const getOwnerResult = await vmQuery({
    contract: stakingContract,
    caller: auctionContract,
    func: 'getOwner',
    args: [publicKey],
  });

  console.log('getOwnerResult', getOwnerResult);

  const [encodedOwnerHex] = getOwnerResult;

  return Buffer.from(encodedOwnerHex, 'base64').toString('hex');
};

let data = [];

const getNodesData = async (ownerHex) => {
  const [contractTopUpBase64, contractStakeBase64, , ...publicKeysBase64] = await vmQuery({
    contract: auctionContract,
    func: 'getTotalStakedTopUpStakedBlsKeys',
    args: [ownerHex],
  });

  const contractStakeHex = Buffer.from(contractStakeBase64, 'base64').toString('hex');
  const contractStake = BigInt(contractStakeHex ? '0x' + contractStakeHex : contractStakeHex);
  const stake = String(contractStake / BigInt(publicKeysBase64.length));

  const contractTopUpHex = Buffer.from(contractTopUpBase64, 'base64').toString('hex');
  const contractTopUp = BigInt(contractTopUpHex ? '0x' + contractTopUpHex : contractTopUpHex);
  const topUp = String(contractTopUp / BigInt(publicKeysBase64.length));

  const publicKeys = publicKeysBase64.map((publicKeyBase64) =>
    Buffer.from(publicKeyBase64, 'base64').toString('hex')
  );

  const owner = bech32.encode(ownerHex);

  return publicKeys.map((publicKey) => {
    return { publicKey, owner, stake, topUp };
  });
};

const populateData = async (publicKey) => {
  console.log('data', data);

  const found = data.find((item) => {
    console.log('item', item);
    console.log('item.publicKey', item.publicKey);
    console.log('publicKey', publicKey);

    return item.publicKey === publicKey;
  });

  console.log('found', found);

  if (!found) {
    const owner = await getOwner(publicKey);

    const contractData = await getNodesData(owner);

    console.log('before --> ', data.length);

    data = [data, ...contractData];

    console.log('after --> ', data.length);
  }
};

const getOwners = async (publicKeys) => {
  publicKeys.length = 3;

  await Promise.all(publicKeys.map((publicKey) => populateData(publicKey)));

  console.log(data.length);
  //   console.log(data);
};

module.exports = getOwners;
