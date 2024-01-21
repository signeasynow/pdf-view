function extractTextFromLine(line) {
	// Replace occurrences of \2 followed by numbers or letters with +++++

	// Extract text within parentheses
	const matchResult = line.match(/\((.*?)\)/g);
	return matchResult ? matchResult.map(t => t.slice(1, -1)).join('').trim() : '';
}

function reconstructLine(matches, replacedText) {
	let currentIndex = 0;
	return matches.map(match => {
			const textMatch = match[1];
			const spacingNumber = match[2] ? match[2].trim() : '';
			const segmentLength = textMatch.length;
			const replacement = replacedText.substring(currentIndex, currentIndex + segmentLength);
			currentIndex += segmentLength;
			return `(${replacement})${spacingNumber ? ' ' + spacingNumber : ''}`;
	}).join('');
}

function replaceTextWithSpacesInTJCommand(line) {
	const textLength = extractTextFromLine(line).length;
	const whitespaceReplacement = ' '.repeat(textLength);
	const regex = /\((.*?)\)(\s*\d*\.?\d*\s*)?/g;
	const matches = [...line.matchAll(regex)];
	return reconstructLine(matches, whitespaceReplacement);
}

module.exports = {
  extractTextFromLine,
  reconstructLine,
  replaceTextWithSpacesInTJCommand
};