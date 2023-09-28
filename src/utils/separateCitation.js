export const separateCitation = (text) => {
  const citationRegex = /{"citation":\s*"(.*?)"}\s*/g; // Add 'g' flag for global matching
  let match;
  const citations = [];

  while ((match = citationRegex.exec(text)) !== null) {
    const citationText = match[1].trim();
    const splittedCitations = citationText.split('```').map(c => c.trim()).filter(Boolean);
    citations.push(...splittedCitations);
  }

  const mainText = text.replace(citationRegex, '').trim();
  
  return { main: mainText, citations };
};
