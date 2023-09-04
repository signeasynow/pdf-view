import { useEffect } from 'preact/hooks';

function useDeclareIframeLoaded() {
	useEffect(() => {
		window.onload = function() {
			window.parent.postMessage({ type: 'iframe-loaded', success: true }, '*');
		};
	}, []);

	return null;
}

export default useDeclareIframeLoaded;
