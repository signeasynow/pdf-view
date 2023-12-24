import { createContext } from 'preact';
import { useState } from 'preact/hooks';
import i18n from '../utils/i18n';

export const LocaleContext = createContext({
	locale: null,
	setLocale: () => {}
});

export const LocaleProvider = ({ children }) => {
	const [locale, setLocale] = useState("");

	const onChangeLocale = (v) => {
		i18n.changeLanguage(v);
		setLocale(v);
	}

	return (
		<LocaleContext.Provider value={{ locale, onChangeLocale }}>
			{children}
		</LocaleContext.Provider>
	);
};
