import { createContext } from 'preact';
import { useState } from 'preact/hooks';

export const AuthInfoContext = createContext({
	authInfo: null,
	setAuthInfo: () => {}
});

export const AuthInfoProvider = ({ children }) => {
	const [authInfo, setAuthInfo] = useState([]);

	return (
		<AuthInfoContext.Provider value={{ authInfo, setAuthInfo }}>
			{children}
		</AuthInfoContext.Provider>
	);
};
