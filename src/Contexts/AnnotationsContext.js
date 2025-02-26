import { createContext } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

export const AnnotationsContext = createContext({
	annotations: [],
	setAnnotations: () => {},
	annotationsRef: { current: [] }
});

export const AnnotationsProvider = ({ children }) => {
	const [annotations, setAnnotations] = useState([]);
	const annotationsRef = useRef([]);
	const [activeSignerId, setActiveSignerId] = useState(null);

	useEffect(() => {
		// annotationsRef.current = annotations;
	}, [annotations]);

	return (
		<AnnotationsContext.Provider value={{
			annotations,
			setAnnotations,
			annotationsRef,
			activeSignerId,
			setActiveSignerId
		}}>
			{children}
		</AnnotationsContext.Provider>
	);
};
