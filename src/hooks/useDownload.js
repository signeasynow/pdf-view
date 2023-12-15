import JSZip from 'jszip';
import fetchBuffers from '../utils/fetchBuffers';
import { useContext } from 'preact/hooks';
import { AnnotationsContext } from '../Contexts/AnnotationsContext';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const parseColor = (colorStr) => {
	const red = parseInt(colorStr.substr(1, 2), 16) / 255;
	const green = parseInt(colorStr.substr(3, 2), 16) / 255;
	const blue = parseInt(colorStr.substr(5, 2), 16) / 255;
	return { red, green, blue };
};

const downloadAll = async (pdfBuffers) => {
	// Initialize JSZip instance
	const zip = new JSZip();

	// Loop over all PDF Buffers and add them to the ZIP file
	pdfBuffers.forEach((buffer, index) => {
		zip.file(`document-${index + 1}.pdf`, buffer);
	});

	// Generate ZIP file as Blob
	const zipBlob = await zip.generateAsync({ type: 'blob' });

	// Trigger download of ZIP file
	const url = URL.createObjectURL(zipBlob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'AllDocuments.zip';
	link.click();

	// Cleanup
	URL.revokeObjectURL(url);
};

async function getFontForAnnotation(pdfDoc, annotation) {
	switch (annotation.fontFamily?.toLowerCase()) {
		case 'courier':
			return await pdfDoc.embedFont(StandardFonts.Courier);
		case 'helvetica':
			return await pdfDoc.embedFont(StandardFonts.Helvetica);
		default:
			return await pdfDoc.embedFont(StandardFonts.Courier); // Default font
	}
}

export const modifyPdfBuffer = async (buffer, annotations) => {
	const pdfDoc = await PDFDocument.load(buffer);

	// Apply annotations
	for (const annotation of annotations) {
		const page = pdfDoc.getPage(annotation.pageNumber - 1);

		switch (annotation.name) {
			case 'freeTextEditor':
						  // TODO: Enable helvetica
				const font = await getFontForAnnotation(pdfDoc, annotation);
				const color = parseColor(annotation.color);
				const textHeight = annotation.fontSize; // Approximate text height
				page.drawText(annotation.content, {
					x: (annotation.x * page.getWidth()) + 2,
					y: ((1 - annotation.y) * page.getHeight()) - textHeight - 2, // - fontSizeInPoints,
					size: annotation.fontSize,
					font,
					color: rgb(color.red, color.green, color.blue)
				});
				break;
			case 'stampEditor':
				// Example for stamp annotation
				const jpgImage = await pdfDoc.embedPng(annotation.urlPath);
				page.drawImage(jpgImage, {
					x: annotation.x * page.getWidth(),
					y: (1 - annotation.y - annotation.height) * page.getHeight(),
					width: annotation.width * page.getWidth(),
					height: annotation.height * page.getHeight()
				});
				break;
					// Add cases for other annotation types
		}
	}

	// Return modified PDF buffer
	return await pdfDoc.save();
};

function useDownload(files, isSandbox, fileNames) {

	const { annotations } = useContext(AnnotationsContext);

	const triggerDownload = async () => {
		if (isSandbox) {
			// return alert("Download is not enabled in Sandbox mode.");
		}
		let successfulBuffers = await fetchBuffers(files.slice(0, fileNames.length));
		if (!successfulBuffers.length) {
			return alert('Nothing to download.');
		}

		// Check if there's only one PDF
		if (successfulBuffers.length === 1) {
			try {
				// Modify single PDF buffer
				const modifiedPdfBuffer = await modifyPdfBuffer(successfulBuffers[0], annotations);
				const blob = new Blob([modifiedPdfBuffer], { type: 'application/pdf' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = fileNames[0];
				link.click();
			}
			catch (error) {
				console.error('Error modifying PDF:', error);
			}
		}
		else {
			// Modify all PDF buffers
			const modifiedBuffers = await Promise.all(successfulBuffers.map(buffer => modifyPdfBuffer(buffer, annotations)));
			downloadAll(modifiedBuffers);
		}
	};

	return {
		triggerDownload
	};
}

export default useDownload;
