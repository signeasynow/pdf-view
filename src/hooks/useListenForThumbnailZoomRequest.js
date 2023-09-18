import { useEffect } from 'preact/hooks';

function useListenForThumbnailZoomRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			if (event.data && event.data.type === 'set-thumbnail-zoom') {
				const num = event.data.value * 10;
				callback(num);
    	}
		};
		window.addEventListener('message', messageFunc, false);
		return () => {
			window.removeEventListener('message', messageFunc);
		};
	}, [callback]);

	return null;
}

export default useListenForThumbnailZoomRequest;
