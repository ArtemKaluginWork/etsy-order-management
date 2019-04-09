function chunkArray(myArray, chunkSize) {
  const arrayLength = myArray.length;
  const tempArray = [];

  for (let index = 0; index < arrayLength; index += chunkSize) {
    const myChunk = myArray.slice(index, index + chunkSize);
    tempArray.push(myChunk);
  }
  return tempArray;
}

module.exports = {
  chunkArray,
};
