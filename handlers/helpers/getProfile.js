const axios = require('axios');

const { axiosConfig } = require(`../configs/${process.env.CONFIG}`);

const getProfile = async (identity) => {
  let value;

  try {
    const { status, data } = await axios.get(
      `https://keybase.io/_/api/1.0/user/lookup.json?username=${identity}`,
      axiosConfig
    );

    if (status === 200 && data.status.code === 0) {
      const { profile, pictures } = data.them;

      const { proofs_summary } = data.them || {};
      const { all } = proofs_summary || {};

      const twitter = all.find((element) => element['proof_type'] === 'twitter');
      const website = all.find(
        (element) => element['proof_type'] === 'dns' || element['proof_type'] === 'generic_web_site'
      );

      value = {
        identity,
        name: profile && profile.full_name ? profile.full_name : undefined,
        description: profile && profile.bio ? profile.bio : undefined,
        avatar:
          pictures && pictures.primary && pictures.primary.url ? pictures.primary.url : undefined,
        twitter: twitter && twitter.service_url ? twitter.service_url : undefined,
        website: website && website.service_url ? website.service_url : undefined,
        location: profile && profile.location ? profile.location : undefined,
      };
    } else {
      value = false;
    }
  } catch (error) {
    value = false;
    console.log(error);
  }

  return value;
};

module.exports = getProfile;
