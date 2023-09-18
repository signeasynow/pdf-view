import { useEffect } from 'preact/hooks';

function useListenForExtractPagesRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			console.log(event.data, 'event.data.value3', event.data.type)
			if (event.data && event.data.type === 'extract-pages') {
				console.log("extract-pages", event.data, event.data.value)
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

export default useListenForExtractPagesRequest;
