import { useEffect, useRef } from 'preact/hooks';
import { useUserData } from './useUserData';

function useListenForAiQuestionCount(conversation, setAiLimitReached) {

  const { hasValidSubscription } = useUserData();

  const isThrottled = useRef(false);

	const checkConsumerSubscription = async () => {
		if (isThrottled.current) {
			return;
		}
		isThrottled.current = true;
	
		setAiLimitReached(!hasValidSubscription);
		if (hasValidSubscription) {
			window.localStorage.setItem('timestamps', '[]');
		}
		setTimeout(() => {
			isThrottled.current = false;
		}, 1000);
	};

	useEffect(() => {
		const currentTime = new Date().getTime();
		let timestamps = JSON.parse(window.localStorage.getItem('timestamps') || '[]');
	
		// Filter out timestamps older than 24 hours
		timestamps = timestamps.filter(ts => currentTime - ts < 24 * 60 * 60 * 1000);
	
		// Save the filtered timestamps back to localStorage
		window.localStorage.setItem('timestamps', JSON.stringify(timestamps));
	
		// Check if more than 10 questions have been asked in the past 24 hours
		if (timestamps.length > 10) {
			checkConsumerSubscription();
		}
	
		// Add a new timestamp for the current question
		timestamps.push(currentTime);
		window.localStorage.setItem('timestamps', JSON.stringify(timestamps));
		
	}, [conversation]);

	return null;
}

export default useListenForAiQuestionCount;
