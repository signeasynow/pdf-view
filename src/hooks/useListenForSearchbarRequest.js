import { useEffect } from 'preact/hooks';

function useListenForSearchbarRequest(callback) {
	useEffect(() => {
		const messageFunc =  (event) => {
			if (event.data && event.data.type === 'toggle-searchbar') {
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

export default useListenForSearchbarRequest;
