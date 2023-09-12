import { savePDF } from "./indexDbUtils";
import { PDFDocument, rgb, StandardFonts, PDFName, degrees, pushGraphicsState, popGraphicsState, PDFOperator } from 'pdf-lib';

async function addWatermark(pdfBytes, copy) {
  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Embed the Helvetica font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // Use Bold for thicker text

  const extGStateDict = pdfDoc.context.obj({
    Type: 'ExtGState',
    ca: 0.6,
    CA: 0.6,
  });

  // Get all the pages in the PDF
  const pages = pdfDoc.getPages();

  const extGStateDictRef = pdfDoc.context.register(extGStateDict);

  // Draw a watermark on each page
  for (const page of pages) {
    const { width, height } = page.getSize();
    const text = copy;
    const fontSize = 24; // Make text bigger

    const x = width / 2;
    const y = height / 1.5;

    const opacity = 0.1; // Opacity from 0 to 1

    const { Resources } = page.node.normalizedEntries();
    Resources.set(PDFName.of('ExtGState'), pdfDoc.context.obj({ GS1: extGStateDictRef }));

    // Push the graphics state before drawing the text
    page.pushOperators(pushGraphicsState());
    page.pushOperators(PDFOperator.of('/GS1 gs'));  // Set graphics state directly

    // Calculate text width and height to position in center
    const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;

    page.drawText(text, {
      x: x - textWidth / 2,
      y: y - textHeight / 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1, opacity), // Add the opacity as the 4th argument
      rotate: degrees(-45), // 45 degrees for diagonal text
    });

    page.pushOperators(popGraphicsState());

  }

  // Serialize the PDF
  let result = await pdfDoc.save();

  return result;
}

export const addSandboxWatermark = async (buffer) => {
  // const buffer = await pdfProxyObj.getData();
  const modifiedPdfArray = await addWatermark(buffer, "Demo - Yuzbi.com");

  // await savePDF(modifiedPdfArray, 'pdfId1');
  return modifiedPdfArray;
};
