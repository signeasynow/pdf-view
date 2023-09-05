import { useEffect } from 'preact/hooks';

function usePropagateClickEvents() {
	useEffect(() => {
		const handleClick = () => {
			// Create a new event
			const newEvent = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window.parent,
			});
    
			// Dispatch the event to the parent document
			window.parent.document.dispatchEvent(newEvent);
		};

		window.addEventListener('click', handleClick);

		return () => {
			window.removeEventListener('click', handleClick);
		};
	}, []);

	return null;
}

export default usePropagateClickEvents;
