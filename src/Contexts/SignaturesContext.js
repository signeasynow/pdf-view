import { createContext } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

export const SignaturesContext = createContext({
	fullSignature: '',
	setFullSignature: () => {},
	initialsSignature: '',
	setInitialsSignature: () => {}
});

export const SignaturesProvider = ({ children }) => {
	const [fullSignature, setFullSignature] = useState(localStorage.getItem('signatureImage'));
	const [initialsSignature, setInitialsSignature] = useState(localStorage.getItem('initialsImage'));

	return (
		<SignaturesContext.Provider value={{
			fullSignature,
			setFullSignature,
			initialsSignature,
			setInitialsSignature
		}}
		>
			{children}
		</SignaturesContext.Provider>
	);
};
