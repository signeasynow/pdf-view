import { useEffect } from 'preact/hooks';

function useListenForThumbnailZoomRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			console.log(event.data, 'event data11', event.data.type)
			if (event.data && event.data.type === 'set-thumbnail-zoom') {
				console.log("thumb zoom", event.data, event.data.value)
				const num = event.data.value * 10;
				console.log(num, 'num33')
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
