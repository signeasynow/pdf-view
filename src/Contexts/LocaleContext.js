import { createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import i18n from '../utils/i18n';

export const LocaleContext = createContext({
	locale: null,
	setLocale: () => {}
});

export const LocaleProvider = ({ children }) => {
	const [locale, setLocale] = useState("");

	useEffect(() => {
    // This side effect updates the document's `dir` attribute when the locale changes
    const direction = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', locale);

    // i18n.changeLanguage(locale);
  }, [locale]); // Only re-run the effect if the locale changes

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
