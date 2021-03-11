const getChunks = (array, size = 25) => {
  return array.reduce((result, item, current) => {
    const index = Math.floor(current / size);

    if (!result[index]) {
      result[index] = [];
    }

    result[index].push(item);

    return result;
  }, []);
};

module.exports = getChunks;
