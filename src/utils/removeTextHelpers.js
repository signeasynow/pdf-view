function extractTextFromLine(line) {
	// Extract text within parentheses
	const matchResult = line.match(/\((.*?)\)/g);
	return matchResult ? matchResult.map(t => t.slice(1, -1)).join('') : '';
}

function replaceTextWithSpacesInTJCommand(line) {
	const textLength = extractTextFromLine(line).length;
	// -1 is a thousandth of a unit. we are averaging for half of a unit per character.
	return `[() -${textLength * 500} ()]`;
}

/**
 * Searches for the first color definition in 'lines' array from 'startIndex' backwards and converts it to a hex color code.
 * Returns the hex color code if found, otherwise null.
 */
function findHexColor(lines, startIndex) {
	for (let i = startIndex - 1; i >= 0; i--) {
			if (lines[i]?.toLowerCase().trim().endsWith('scn')) {
					const colorValues = lines[i].match(/([\d.]+) {1,}([\d.]+) {1,}([\d.]+) {1,}scn/);
					// console.log(colorValues, 'colorValues test', lines[i])
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

function processLinesMultipleCommands(lines, clickedTextString) {
	let accumulatedText = '';
	let accumulatedMatches = [];
	let matchingIndexes = [];
	let fullMatchFound = false;
	let color;

	for (const [index, line] of lines.entries()) {
		if (fullMatchFound) break; // Break out of the loop if full match is found

		if (line.toUpperCase().endsWith('TJ')) {
				const currentText = extractTextFromLine(line);
				if (clickedTextString.includes(currentText)) {
						accumulatedText += currentText;
						accumulatedMatches.push(line);
						matchingIndexes.push(index);
						if (accumulatedText.replace(/\s+/g, '').includes(clickedTextString.replace(/\s+/g, ''))) {
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

function isTextCommand(line) {
	return line.trim().toUpperCase().endsWith('TJ');
}

function processLinesSingleCommand(lines, clickedTextString) {
	console.log(clickedTextString, 'clicked', lines)
	let _foundMatch = false;
	let color;
	const result = lines.map((line, index) => {
			if (isTextCommand(line)) {
					// console.log(line, 'line6')
					const result = processSingleTJCommand(line, clickedTextString);
					if (result !== null) {
						// console.log(line, clickedTextString, 'huh fo')
						_foundMatch = true;
						color = findHexColor(lines, index);
						// console.log(color, 'color start')
						// console.log(result, 'result 44')
						const final = result + (result.trim().toUpperCase().endsWith('TJ') ? '' : ' TJ');
						// console.log(final, 'final 3')
						return final;
					}
			}
			return line;
	});
	// console.log(lines, 'lines here3')
	return { lines: result, foundMatch: _foundMatch, color }
};

function checkIsHexadecimalString(line) {
	const hexStringPattern = /<([0-9A-Fa-f]+)>/;
	return hexStringPattern.test(line);
}

function extractFontFromLine(line) {
	// Regular expression to match the PDF font setting command
	const fontRegex = /\/([A-Za-z0-9_]+)\s+\d+\s+Tf/;
	const match = line.match(fontRegex);

	if (match && match.length > 1) {
			// The font name is captured in the first group of the regex
			return match[1];
	}

	// Return null or a default value if no font is found
	return null;
}

function findFont(lines, startIndex) {
	for (let i = startIndex - 1; i >= 0; i--) {
		if (lines[i]?.toLowerCase().trim().endsWith('tf')) {
			const font = extractFontFromLine(lines[i]);
			if (!!font) {
				return font;
			}
		}
	}
	return null;
}

function formatHexadecimalString(line, allCMaps, lines, defaultFont, lineIndex) {
	if (!isTextCommand(line)) {
		return line;
	}
	const isHexString = checkIsHexadecimalString(line);
	if (!isHexString) {
		return line;
	}
	return isHexString;
}

module.exports = {
	findFont,
	extractFontFromLine,
	checkIsHexadecimalString,
	formatHexadecimalString,
	processSingleTJCommand,
	processLinesSingleCommand,
	processLinesMultipleCommands,
  extractTextFromLine,
  replaceTextWithSpacesInTJCommand,
	findHexColor
};