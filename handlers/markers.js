const { response, getMarkers } = require('./helpers');

const {
  cache: { moderate },
} = require(`./configs/${process.env.CONFIG}`);

let globalMarkers;

exports.handler = async () => {
  try {
    let markers;
    // attempt to reload the markers once
    if (globalMarkers) {
      markers = globalMarkers;
    } else {
      markers = await getMarkers();
      globalMarkers = markers;
    }

    if (!markers) {
      throw new Error('feed unavailable');
    }

    return response({ data: markers, cache: moderate });
  } catch (error) {
    console.error('markers error', error);
    return response({ status: 503 });
  }
};
