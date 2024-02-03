import { useEffect } from 'preact/hooks';

function useDeclareIframeLoaded() {
	useEffect(() => {
		window.onload = function() {
			window.parent.postMessage({ type: 'iframe-loaded', success: true, env: process.env.NODE_ENV }, '*');
		};
	}, []);

	return null;
}

export default useDeclareIframeLoaded;
