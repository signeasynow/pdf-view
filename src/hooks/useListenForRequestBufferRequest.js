import { useEffect } from 'preact/hooks';

function useListenForRequestBufferRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			if (event.data && event.data.type === 'request-buffer') {
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

export default useListenForRequestBufferRequest;
