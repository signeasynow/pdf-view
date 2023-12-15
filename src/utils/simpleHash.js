function simpleHash(inputStr) {
	let hashValue = 0;
  
	for (let i = 0; i < inputStr.length; i++) {
		const char = inputStr.charCodeAt(i);
		hashValue = (hashValue << 5) - hashValue + char;
	}

	return hashValue.toString();
}

export default simpleHash;
