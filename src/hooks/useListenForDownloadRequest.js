import { useEffect } from 'preact/hooks';

function useListenForDownloadRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			if (event.data && event.data.type === 'download') {
				callback();
    	}
		};
		window.addEventListener('message', messageFunc, false);
		return () => {
			window.removeEventListener('message', messageFunc);
		};
	}, [callback]);

	return null;
}

export default useListenForDownloadRequest;
