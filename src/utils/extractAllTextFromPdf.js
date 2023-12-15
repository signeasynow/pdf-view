export async function extractAllTextFromPDF(pdfDocument) {
	const sections = [];

	for (let i = 1; i <= pdfDocument.numPages; i++) {
		const page = await pdfDocument.getPage(i);
		const textContent = await page.getTextContent();
		const textItems = textContent.items;

		let paragraph = '';  // To accumulate text for a paragraph
		let paragraphCount = 0;  // To keep track of paragraph number

		textItems.forEach((item, index) => {
			// Add the text to the current paragraph string.
			paragraph += item.str;

			// Heuristic: If the text ends with a character typical for ending a sentence or a paragraph,
			// or if this is the last item, then we treat it as the end of the paragraph.
			if (item.str.match(/[\.\?\!]\s*$/) || index === textItems.length - 1) {
				paragraphCount++;  // Increment the paragraph count
				sections.push({ page: i, paragraph: paragraphCount, text_span: paragraph.trim() });
				paragraph = '';
			}
			else {
				// Otherwise, add a space before the next sentence.
				paragraph += ' ';
			}
		});
	}

	return sections;
}