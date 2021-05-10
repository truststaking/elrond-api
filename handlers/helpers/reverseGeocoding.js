const { axios } = require('./axiosWrapper');
const { googleMapsAPIKey } = require(`../configs/${process.env.CONFIG}`);

const reverseGeocoding = async ({ lat, long }) => {
  if (!lat || !long) return {};

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${googleMapsAPIKey}`;
  const {
    data: {
      results: [{ address_components: addressComponents }],
    },
  } = await axios.get(url);

  const addresses = addressComponents
    .map((addressComponent) => {
      if (addressComponent.types.includes('country')) {
        return { country: addressComponent['short_name'] };
      }
      if (addressComponent.types.includes('locality')) {
        return { city: addressComponent['long_name'] };
      } else if (addressComponent.types.includes('administrative_area_level_2')) {
        return { city: addressComponent['long_name'] };
      } else if (addressComponent.types.includes('administrative_area_level_1')) {
        return { city: addressComponent['long_name'] };
      }
    })
    .filter((element) => element != undefined);

  let city;
  let country;
  for (const index in addresses) {
    if (addresses[index].country) country = addresses[index].country;
    if (addresses[index].city) city = addresses[index].city;
  }

  return { city, country };
};

module.exports = reverseGeocoding;
