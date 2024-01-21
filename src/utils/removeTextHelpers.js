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

function processLinesMultipleCommands(lines, originalString) {
	let accumulatedText = '';
	let accumulatedMatches = [];
	let matchingIndexes = [];
	let fullMatchFound = false;
	let color;

	for (const [index, line] of lines.entries()) {
		if (fullMatchFound) break; // Break out of the loop if full match is found

		if (line.toUpperCase().endsWith('TJ')) {
				const currentText = extractTextFromLine(line);
				if (originalString.includes(currentText)) {
						accumulatedText += currentText;
						accumulatedMatches.push(line);
						matchingIndexes.push(index);
						if (accumulatedText.replace(/\s+/g, '').includes(originalString.replace(/\s+/g, ''))) {
								fullMatchFound = true;  // Set the flag when full match is found
								color = findHexColor(lines, index);
								break; // Break out of the loop after processing
						}
				} else {
						accumulatedText = '';
						accumulatedMatches = [];
						matchingIndexes = [];
				}
		}
	}
	return {
		lines: lines.map((line, index) => {
			if (matchingIndexes.includes(index)) {
				const result = replaceTextWithSpacesInTJCommand(line);
				return result + (result.trim().endsWith('TJ') ? '' : ' TJ');	
			}
			return line;
		}),
		color
	};
};

function processSingleTJCommand(line, targetString) {
	const modLine = line.replace(/\\\(/g, 'PLACEHOLDER_PARENTHESIS_OPEN')
			.replace(/\\\)/g, 'PLACEHOLDER_PARENTHESIS_CLOSE');
	const modTarget = targetString
			.replace(/\\\(/g, 'PLACEHOLDER_PARENTHESIS_OPEN')
			.replace(/\\\)/g, 'PLACEHOLDER_PARENTHESIS_CLOSE')
			.replace(/\(/g, 'PLACEHOLDER_PARENTHESIS_OPEN')
			.replace(/\)/g, 'PLACEHOLDER_PARENTHESIS_CLOSE')
			.trim();

	const concatenatedText = extractTextFromLine(modLine).trim();

	let regexPattern = concatenatedText.replace(/\\2[0-9]{2}/g, '.');

	regexPattern = '^' + regexPattern + '$';

	// Create a RegExp object
	const regex = new RegExp(regexPattern);

	if (regex.test(modTarget)
		// this is too much of a cop out
		&& regex.toString() !== "/^.$/" && regex.toString() !== "/^$/") {
			return replaceTextWithSpacesInTJCommand(line);
	}

	return null; // Indicate no replacement was made
}

const processLinesSingleCommand = (lines, originalString) => {
	let _foundMatch = false;
	let color;
	const result = lines.map((line, index) => {
			if (line.toUpperCase().endsWith('TJ')) {
					const result = processSingleTJCommand(line, originalString);
					if (result !== null) {
						_foundMatch = true;
						color = findHexColor(lines, index);
						return result + (result.trim().toUpperCase().endsWith('TJ') ? '' : ' TJ');
					}
			}
			return line;
	});
	return { lines: result, foundMatch: _foundMatch, color }
};

module.exports = {
	processSingleTJCommand,
	processLinesSingleCommand,
	processLinesMultipleCommands,
  extractTextFromLine,
  reconstructLine,
  replaceTextWithSpacesInTJCommand,
	findHexColor
};