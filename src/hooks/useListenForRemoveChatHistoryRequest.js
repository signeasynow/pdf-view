import { useEffect } from 'preact/hooks';

function useListenForRemoveChatHistoryRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			if (event.data && event.data.type === 'remove-chat-history') {
				callback(event.data.value);
    	}
		};
		window.addEventListener('message', messageFunc, false);
		return () => {
			window.removeEventListener('message', messageFunc);
		};
	}, [callback]);

	return null;
}

export default useListenForRemoveChatHistoryRequest;
