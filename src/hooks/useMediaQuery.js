import { useEffect, useState } from 'preact/hooks';

export const useMediaQuery = (query) => {
	const [matches, setMatches] = useState(window.matchMedia(query).matches);

	useEffect(() => {
		const mediaQueryList = window.matchMedia(query);
		const handleChange = (event) => {
			setMatches(event.matches);
		};

		mediaQueryList.addEventListener('change', handleChange);
    
		return () => {
			mediaQueryList.removeEventListener('change', handleChange);
		};
	}, [query]);

	return matches;
};
