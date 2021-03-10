const { axios } = require('./axiosWrapper');

const confirmNodeIdentity = async ({ identity, publicKey }) => {
  try {
    const { status } = await axios.head(`https://keybase.pub/${identity}/elrond/${publicKey}`);
    return status === 200;
  } catch (error) {
    return false;
  }
};

module.exports = confirmNodeIdentity;
