import JSZip from 'jszip';
import fetchBuffers from '../utils/fetchBuffers';
import { useContext } from 'preact/hooks';
import { AnnotationsContext } from '../Contexts/AnnotationsContext';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useModal } from '../Contexts/ModalProvider';
import { useUserData } from './useUserData';
import { useTranslation } from 'react-i18next';

const MAX_DOWNLOADS_PER_DAY = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DOWNLOAD_ATTEMPTS_KEY = 'downloadAttempts';

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
	const standardFontMap = {
		courier: StandardFonts.Courier,
		helvetica: StandardFonts.Helvetica,
		timesroman: StandardFonts.TimesRoman
	};
	const boldFontMap = {
		courier: StandardFonts.CourierBold,
		helvetica: StandardFonts.HelveticaBold,
		timesroman: StandardFonts.TimesRomanBold
	};
	console.log(annotation, 'annotation24')
	let fontName;
	if (annotation.fontWeight === 600) {
		fontName = boldFontMap[annotation.fontFamily?.toLowerCase()] || StandardFonts.TimesRomanBold; // Default font
	} else {
		fontName = standardFontMap[annotation.fontFamily?.toLowerCase()] || StandardFonts.TimesRoman; // Default font
	}
	return await pdfDoc.embedFont(fontName);
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

function useDownload(files, isSandbox, fileNames, storage) {

	const { annotations } = useContext(AnnotationsContext);

	const { showAuthModal } = useModal();

	const { t } = useTranslation();

	const checkAndRecordDownloadAttempt = async () => {
			try {
					// Retrieve download attempts from storage
					let downloadAttempts = await storage.retrieve(DOWNLOAD_ATTEMPTS_KEY, false);
					downloadAttempts = downloadAttempts.filter(time => Date.now() - time < ONE_DAY_MS);

					if (downloadAttempts.length >= MAX_DOWNLOADS_PER_DAY) {
							throw new Error(t("you-reached-max"));
					}

					// Record new download attempt
					downloadAttempts.push(Date.now());
					await storage.save(downloadAttempts, DOWNLOAD_ATTEMPTS_KEY, false);
			} catch (error) {
					// Handle case where no record is found or other errors
					if (error?.message?.includes("No record found") || error.includes("No record found")) {
							await storage.save([Date.now()], DOWNLOAD_ATTEMPTS_KEY, false);
					} else {
							throw error;
					}
			}
	};

	const { hasValidSubscription } = useUserData();


	const triggerDownload = async () => {
		try {
			if (!hasValidSubscription && process.env.NODE_ENV !== "development") {
				await checkAndRecordDownloadAttempt();
			}
		} catch (error) {
				showAuthModal(null, t("create-account-subscribe"));
				return;
		}

		if (isSandbox) {
			// return alert("Download is not enabled in Sandbox mode.");
		}
		let successfulBuffers = await fetchBuffers(files.slice(0, fileNames.length), storage);
		if (!successfulBuffers.length) {
			return alert(t("nothing-to-download"));
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
