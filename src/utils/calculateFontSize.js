function calculateFontSize(originalHeight, scalingFactor = 500, minFontSize = 10, maxFontSize = 24, stepSize = 1) {
  let scaledHeight = originalHeight * scalingFactor;

  // Calculate expected fontSize
  let expectedFontSize = Math.floor(scaledHeight / stepSize) * stepSize;

  // Apply min and max constraints
  return Math.max(minFontSize, Math.min(expectedFontSize, maxFontSize));
}

module.exports = {
  calculateFontSize
}