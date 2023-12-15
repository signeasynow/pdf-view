import { separateCitation } from './separateCitation';

export const extractLastThreeQA = (conversation) => {
	const lastThreeQA = [];
	let questionCount = 0;

	// Iterating in reverse to get the latest Q&As
	for (let i = conversation.length - 1; i >= 0; i--) {
		const entry = conversation[i];
		if (entry.type === 'question') {
			questionCount++;
		}
		lastThreeQA.unshift({
			role: entry.type === 'question' ? 'user' : 'assistant',
			content: separateCitation(entry.text).main
		});

		if (questionCount === 3) {
			break;
		}
	}

	return lastThreeQA;
};
