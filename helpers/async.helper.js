async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array); // eslint-disable-line
  }
}
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  asyncForEach,
  timeout,
};
