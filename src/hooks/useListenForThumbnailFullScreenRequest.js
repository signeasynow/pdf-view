import { useEffect } from 'preact/hooks';

function useListenForThumbnailFullScreenRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			if (event.data && event.data.type === 'toggle-full-screen-thumbnails') {
				callback(event.data.enable);
    	}
		};
		window.addEventListener('message', messageFunc, false);
		return () => {
			window.removeEventListener('message', messageFunc);
		};
	}, [callback]);

	return null;
}

export default useListenForThumbnailFullScreenRequest;
