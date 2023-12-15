export const separateCitation = (text) => {
	const prefix = `{"citation": "`;
	let idx = 0;
	let nextIdx;
	const citations = [];
	let mainText = '';

	while ((nextIdx = text.indexOf(prefix, idx)) !== -1) {
		mainText += text.substring(idx, nextIdx); // Add text before citation
		idx = nextIdx + prefix.length; // Move index to start of citation content

		let endIdx = text.indexOf('"}', idx);
		if (endIdx === -1) {
			// Incomplete citation, take the rest of the string
			const incompleteCitation = text.substring(idx).split('```').map(c => c.trim()).filter(Boolean);
			citations.push(...incompleteCitation);
			break;
		}
		else {
			// Complete citation
			const citationText = text.substring(idx, endIdx).trim();
			const splittedCitations = citationText.split('```').map(c => c.trim()).filter(Boolean);
			citations.push(...splittedCitations);
			idx = endIdx + 2; // Move index to after this complete citation
		}
	}

	mainText += text.substring(idx); // Add any remaining text
	mainText = mainText.trim();

	return { main: mainText, citations };
};
