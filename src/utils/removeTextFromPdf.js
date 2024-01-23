import { PDFDict, PDFDocument, PDFName, PDFRawStream, PDFRef, arrayAsString, decodePDFRawStream } from 'pdf-lib';
import pako from 'pako';
import { formatHexadecimalString, processLinesMultipleCommands, processLinesSingleCommand } from './removeTextHelpers';

async function getToUnicodeStream(pdfDoc, fontObj) {
	const toUnicodeRef = fontObj.get(PDFName.of('ToUnicode'));
	const toUnicodeStream = pdfDoc.context.lookup(toUnicodeRef);

	// toUnicodeStream is the stream object you need
	return toUnicodeStream;
}

function parseCMap(cmapData) {
	const cmap = {};
	const bfCharRegex = /<([0-9A-F]+)> <([0-9A-F]+)>/g;
	let match;

	while ((match = bfCharRegex.exec(cmapData)) !== null) {
			const [fullMatch, pdfCharCode, unicodeCharCode] = match;
			// Convert each pair of characters in the unicodeCharCode to a unicode character
			const charStr = unicodeCharCode.match(/.{1,4}/g)
											.map(code => String.fromCharCode(parseInt(code, 16)))
											.join('');
			cmap[pdfCharCode] = charStr;
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

async function getCMapsForAllFonts(fontDict, pdfDoc) {
	const cmaps = {};
	for (const fontName of fontDict.keys()) {
			const fontRef = fontDict.get(fontName);
			const fontObj = pdfDoc.context.lookup(fontRef);
			const unicodeStream = await getToUnicodeStream(pdfDoc, fontObj);
			const decoded = decodeStream(unicodeStream);
			const cmap = parseCMap(decoded);
			cmaps[fontName.encodedName] = cmap;
	}
	return cmaps;
}

export async function removeTextFromPdf(pdfBytes, detail, pageNumber) {
	const pdfDoc = await PDFDocument.load(pdfBytes);
	const pages = pdfDoc.getPages();

	let color;

	const targetPage = pages[pageNumber - 1];

	const resources = targetPage.node.Resources();

	const fontDict = resources.get(PDFName.of('Font'));
	let allCMaps = {};
	// TODO: first clean up each hexadecimal string
	// map through, if hexadecimal, find last font command (TF) and if not found, use detail.textState.fontName
	// reconstruct text to right format [(my text)] TJ.
	// then proceed as usual
	if (fontDict instanceof PDFDict) {
		allCMaps = await getCMapsForAllFonts(fontDict, pdfDoc);
  }

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

		const clickedTextString = detail.str.replace(/-\s*$/, '')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)');

		const splitText = text.split('\n');
		// Split the stream by new lines and process only lines ending with 'TJ'
		const lines = splitText.map((line, index) => formatHexadecimalString(line, allCMaps, splitText, detail.textState.fontName, index, clickedTextString));
		


		
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
	const saved = await pdfDoc.save();
	return {
		document: saved,
		color
	};
}