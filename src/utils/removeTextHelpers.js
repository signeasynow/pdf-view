function extractTextFromLine(line) {
	// Extract text within parentheses
	const matchResult = line.match(/\((.*?)\)/g);
	return matchResult ? matchResult.map(t => t.slice(1, -1)).join('') : '';
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

/**
 * Searches for the first color definition in 'lines' array from 'startIndex' backwards and converts it to a hex color code.
 * Returns the hex color code if found, otherwise null.
 */
function findHexColor(lines, startIndex) {
	for (let i = startIndex - 1; i >= 0; i--) {
			if (lines[i]?.toLowerCase().trim().endsWith('scn')) {
					const colorValues = lines[i].match(/([\d.]+) {1,}([\d.]+) {1,}([\d.]+) {1,}scn/);
					if (colorValues && colorValues.length === 4) {
							const hexColor = colorValues.slice(1, 4)
									.map(v => parseInt(parseFloat(v) * 255).toString(16).padStart(2, '0'))
									.join('');
							return `#${hexColor}`;
					}
			}
	}
	return null;
}

module.exports = {
  extractTextFromLine,
  reconstructLine,
  replaceTextWithSpacesInTJCommand,
	findHexColor
};