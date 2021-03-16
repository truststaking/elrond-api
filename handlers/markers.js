const { axios } = require('./helpers');
const {
  cache: { putCache, getCache, batchPutCache },
  response,
  continents,
  reverseGeocoding,
  getChunks,
} = require('./helpers');

exports.handler = async () => {
  try {
    const key = 'markers';
    let data = await getCache({ key });

    if (!data) {
      const { data: responseData } = await axios.get('http://144.91.95.131:53135/geo');

      if (responseData) {
        const publicKeys = Object.keys(responseData);

        data = [];
        let keys = [];
        let values = [];

        for (const index in publicKeys) {
          const { loc } = responseData[publicKeys[index]];

          let [lat, long] = loc.split(',');
          let { city, country } = await reverseGeocoding({ lat, long });

          // For multiple set cache
          keys.push(`${lat}:${long}`);
          values.push({ city, country });

          const continent = continents[country];
          const found = data.find((item) => item.city === city && item.country === country);

          if (found) {
            found.validators += 1;
          } else {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(long);

            data.push({ continent, country, city, latitude, longitude, validators: 1 });
          }
        }

        // Add in cache markers
        await putCache({ key, value: data, ttl: 300 });

        // Add in cache google API requests in chunks with 50 values
        const keysChunks = await getChunks(keys, 50);
        const valuesChunks = await getChunks(values, 50);

        keysChunks.forEach(async (chunk, index) => {
          await batchPutCache({ keys: chunk, values: valuesChunks[index], ttl: 300 });
        });
      }
    }

    return response({ data });
  } catch (error) {
    console.error('markers error', error);
    return response({ status: 503 });
  }
};
