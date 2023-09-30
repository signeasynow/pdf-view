function generateRandomKey(min = 1, max = 1000000) {
  const randomArray = new Uint32Array(1);
  crypto.getRandomValues(randomArray);
  return (randomArray[0] % (max - min + 1)) + min;
}

export default generateRandomKey;
