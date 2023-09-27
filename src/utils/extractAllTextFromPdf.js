export async function extractAllTextFromPDF(pdfDocument) {
  let fullText = "";
  
  for(let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const textItems = textContent.items;
    const pageText = textItems.map(item => item.str).join(" ");
    
    fullText += pageText + " "; // Add a space between text of different pages
  }
  
  return fullText;
}
