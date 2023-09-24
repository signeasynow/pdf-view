import { useEffect } from 'preact/hooks';

function useListenForSplitPagesRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			if (event.data && event.data.type === 'split-pages') {
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

export default useListenForSplitPagesRequest;
