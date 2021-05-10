const { putCache, getCache } = require('./cache');
const getLocations = require('./getLocations');
const { axios } = require('./axiosWrapper');
const continents = require('../configs/continents');

// let globalLocations;

const getMarkers = async () => {
  const key = 'markers';
  const cached = await getCache({ key });

  if (cached) {
    return cached;
  }

  const { data: markers } = await axios.get('http://144.91.95.131:53135/geo');

  const coordinates = Object.values(markers).reduce((accumulator, current) => {
    const { loc } = current;

    if (accumulator[loc]) {
      accumulator[loc] += 1;
    } else {
      accumulator[loc] = 1;
    }

    return accumulator;
  }, {});

  const payload = Object.keys(coordinates).map((pair) => {
    const [lat, long] = pair.split(',');
    return { lat, long };
  });

  let locations = await getLocations(payload);

  const cities = payload
    .map(({ lat, long }, index) => {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(long);
      const { city, country } = locations[index];
      const validators = coordinates[`${lat},${long}`];
      const continent = continents[country];

      return { city, country, latitude, longitude, validators, continent };
    })
    .filter(({ latitude, longitude }) => !!latitude && !!longitude);

  const countries = cities.reduce((accumulator, current) => {
    const found = accumulator.find(({ country }) => country === current.country);

    if (found) {
      found.validators += current.validators;
    } else {
      accumulator.push({
        country: current.country,
        validators: current.validators,
      });
    }

    return accumulator;
  }, []);

  const capitals = cities.reduce((accumulator, current) => {
    if (Object.keys(accumulator).includes(current.country)) {
      if (current.validators > accumulator[current.country].validators) {
        accumulator[current.country] = current;
      }
    } else {
      accumulator[current.country] = current;
    }

    return accumulator;
  }, {});

  countries.forEach((country) => {
    const { city, continent, latitude, longitude } = capitals[country.country];
    country.city = city;
    country.continent = continent;
    country.latitude = latitude;
    country.longitude = longitude;
  });
  await putCache({ key, value: countries, ttl: 21600 }); // 6h

  return countries;
};

module.exports = getMarkers;
