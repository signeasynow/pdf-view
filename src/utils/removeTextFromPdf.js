import { PDFDict, PDFDocument, PDFName, PDFRawStream, PDFRef, arrayAsString, decodePDFRawStream } from 'pdf-lib';
import pako from 'pako';
import { processLinesMultipleCommands, processLinesSingleCommand } from './removeTextHelpers';

async function getToUnicodeStream(pdfDoc, fontObj) {
	const toUnicodeRef = fontObj.get(PDFName.of('ToUnicode'));
	const toUnicodeStream = pdfDoc.context.lookup(toUnicodeRef);

	// toUnicodeStream is the stream object you need
	return toUnicodeStream;
}

function convertHexToString(hexString) {
	let unicodeString = '';

	for (let i = 0; i < hexString.length; i += 4) {
			const code = hexString.substring(i, i + 4);
			const unicodeHex = cmap[code];
			
			if (unicodeHex) {
					for (let j = 0; j < unicodeHex.length; j += 4) {
							const unicodeChar = parseInt(unicodeHex.substring(j, j + 4), 16);
							unicodeString += String.fromCharCode(unicodeChar);
					}
			}
	}

	return unicodeString;
}

function parseCMap(cmapData) {
	const cmap = {};
	const bfCharRegex = /<([0-9A-F]+)> <([0-9A-F]+)>/g;
	let match;

	while ((match = bfCharRegex.exec(cmapData)) !== null) {
			const [fullMatch, pdfCharCode, unicodeCharCode] = match;
			cmap[pdfCharCode] = String.fromCharCode(parseInt(unicodeCharCode, 16));
	}

	return cmap;
}

function decodeStream(toUnicodeStream) {
	let decodedContent = '';

	// Access the stream's filter from its dictionary
	const filter = toUnicodeStream.dict.get(PDFName.of('Filter'));

	try {
			// Access the raw bytes of the stream
			const streamBytes = toUnicodeStream.contents;

			if (filter && filter.toString() === '/FlateDecode') {
					// Decompress the stream using pako if it's FlateDecoded
					decodedContent = pako.inflate(streamBytes, { to: 'string' });
			} else {
					// If the stream is not compressed or uses an unknown filter
					// You might need to convert the byte array to a string
					decodedContent = new TextDecoder().decode(streamBytes);
			}
	} catch (error) {
			console.error('Error decoding stream:', error);
	}

	return decodedContent;
}

function convertPdfHexStringToUnicode(pdfHexString, pdfCMap) {
	let unicodeString = '';

	// Standard ASCII mappings for basic Latin letters and numbers
	const standardCMap = {};
	for (let i = 32; i < 127; i++) {
			const hex = i.toString(16).padStart(4, '0').toUpperCase();
			standardCMap[hex] = String.fromCharCode(i);
	}

	// Merge the PDF-specific CMap with the standard CMap
	const combinedCMap = { ...standardCMap, ...pdfCMap };

	// Remove <, > and split by spaces
	const hexCodes = pdfHexString.replace(/[<>]/g, '').split(/\s+/);
	for (const hexCode of hexCodes) {
			if (hexCode.length === 4) { // Check for length of 4 for each character code
					const unicodeChar = combinedCMap[hexCode.toUpperCase()];
					if (unicodeChar) {
							unicodeString += unicodeChar;
					} else {
							// Handle missing mapping
							console.log(`No mapping for code: ${hexCode}`);
					}
			}
	}

	return unicodeString;
}

export async function removeTextFromPdf(pdfBytes, detail, pageNumber) {
	console.log(detail, 'detail22')
	const pdfDoc = await PDFDocument.load(pdfBytes);
	const pages = pdfDoc.getPages();

	let color;

	const targetPage = pages[pageNumber - 1];

	const resources = targetPage.node.Resources();

	const fontNameFromOriginalString = detail.textState.fontName; // TT2
	console.log(fontNameFromOriginalString, 'fontNameFromOriginalString')
	const fontDict = resources.get(PDFName.of('Font'));
	if (fontDict instanceof PDFDict) {
		const fontRef = fontDict.get(PDFName.of(fontNameFromOriginalString));
		console.log(fontRef, 'fontRef2')
    const fontObj = pdfDoc.context.lookup(fontRef);
		const unicodeStream = await getToUnicodeStream(pdfDoc, fontObj);
		console.log(unicodeStream, 'uni stream')
		const decoded = decodeStream(unicodeStream);
		// console.log(decoded, 'decoded2')
		// TODO: this above info can be used to better construct the actual font-family
		console.log(fontObj, 'compare2');
		const cmap = parseCMap(decoded);
		console.log(cmap, 'cmap2')
		console.log(decoded, 'decoded');
		const uniString = convertPdfHexStringToUnicode("<0057004B00480003005700520053000301060059>", cmap)
		console.log(uniString, 'uniString')
  }
	console.log(fontDict, 'fontDict');
	console.log(resources, 'resources2');

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
		
		const clickedTextString = detail.str.replace(/-\s*$/, '')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)');

		
		// TODO: Test that things don't get overwritten
		const {lines: singleLines, foundMatch, color: singleColor } = processLinesSingleCommand(lines, clickedTextString);
		let modifiedLines = singleLines;
		color ||= singleColor;
		if (!foundMatch) {
			const { lines: multiLines, color: multiColor } = processLinesMultipleCommands(lines, clickedTextString);
			modifiedLines = multiLines;
			color ||= multiColor;
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
	// console.log(color, 'color to use')
	const saved = await pdfDoc.save();
	return {
		document: saved,
		color
	};
}