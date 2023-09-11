import { savePDF } from "./indexDbUtils";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function addWatermark(pdfBytes) {
  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Embed the Helvetica font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get all the pages in the PDF
  const pages = pdfDoc.getPages();

  // Draw a watermark on each page
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText('Watermark Text Here', {
      x: 50,
      y: height - 4 * 12,
      size: 12,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
    });
  }

  // Serialize the PDF
  let result = await pdfDoc.save();

  return result;
}

export const addSandboxWatermark = async (buffer) => {
  // const buffer = await pdfProxyObj.getData();
  const modifiedPdfArray = await addWatermark(new Uint8Array(buffer));

  await savePDF(modifiedPdfArray, 'pdfId1');
  return;
};
