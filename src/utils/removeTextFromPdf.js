import { PDFDocument, PDFRawStream, PDFRef, arrayAsString, decodePDFRawStream } from 'pdf-lib';
import pako from 'pako';
import { extractTextFromLine, findHexColor, replaceTextWithSpacesInTJCommand } from './removeTextHelpers';

export function reconstructLine(matches, replacedText) {
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

export const processLinesMultipleCommands = (lines, originalString) => {
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


export function processSingleTJCommand(line, targetString) {
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

export const processLinesSingleCommand = (lines, originalString) => {
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

export async function removeTextFromPdf(pdfBytes, detail, pageNumber) {
	const pdfDoc = await PDFDocument.load(pdfBytes);
	const pages = pdfDoc.getPages();
	let color;

	const targetPage = pages[pageNumber - 1];

	if (!targetPage) {
		throw new Error(`Page number ${pageNumber} does not exist in the document.`);
  }

	let contentStreams = targetPage.node.Contents();

	// Check if contentStreams is a single stream (PDFRawStream) or an array of streams (PDFArray)
	if (contentStreams instanceof PDFRawStream) {
			contentStreams = [contentStreams]; // Wrap it in an array for uniform processing
	} else if (!contentStreams.array) {
			throw new Error(`No content streams found on page number ${pageNumber}.`);
	} else {
			contentStreams = contentStreams.array;
	}

	await Promise.all(contentStreams.map(async (streamRef) => {
		let stream;
    let isRef = false;

    if (streamRef instanceof PDFRef) {
			stream = pdfDoc.context.lookup(streamRef);
			isRef = true;
    } else if (streamRef instanceof PDFRawStream) {
			stream = streamRef;
    } else {
			throw new Error("Unrecognized stream type.");
    }

		const decoded = decodePDFRawStream(stream).decode();
		let text = arrayAsString(decoded);
		// Split the stream by new lines and process only lines ending with 'TJ'
		const lines = text.split('\n');
		
		const originalString = detail.str.replace(/-\s*$/, '')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)');

		
		const {lines: singleLines, foundMatch, color: singleColor } = processLinesSingleCommand(lines, originalString);
		let modifiedLines = singleLines;
		color = singleColor;
		if (!foundMatch) {
			const { lines: multiLines, color: multiColor } = processLinesMultipleCommands(lines, originalString);
			modifiedLines = multiLines;
			color = multiColor;
	  }

		// Reconstruct the modified content stream
		const modifiedText = modifiedLines.join('\n');
		if (isRef) {
				const newStream = PDFRawStream.of(stream.dict.clone(), pako.deflate(modifiedText));
				pdfDoc.context.assign(streamRef, newStream);
				return stream;
		} else {
				// Directly modify the PDFRawStream
				stream.contents = pako.deflate(modifiedText);
				return stream;
		}
	}));

	const saved = await pdfDoc.save();
	return {
		document: saved,
		color
	};
}