const { axios } = require('./axiosWrapper');

const confirmKeybase = async ({ identity, key, network }) => {
  if (!identity) {
    return false;
  }

  try {
    const url =
      network === 'mainnet'
        ? `https://keybase.pub/${identity}/elrond/${key}`
        : `https://keybase.pub/${identity}/elrond/${network}/${key}`;

    const { status } = await axios.head(url);

    return status === 200;
  } catch (error) {
    return false;
  }
};

module.exports = confirmKeybase;
