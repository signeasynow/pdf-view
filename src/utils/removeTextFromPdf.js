import { PDFDocument, PDFRawStream, PDFRef, arrayAsString, decodePDFRawStream } from 'pdf-lib';
import pako from 'pako';
import { processLinesMultipleCommands, processLinesSingleCommand } from './removeTextHelpers';

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