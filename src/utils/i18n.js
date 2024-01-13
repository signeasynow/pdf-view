import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../locale/en.json';
import es from '../../locale/es.json';
import ru from '../../locale/ru.json';
import de from '../../locale/de.json';
import hi from '../../locale/hi.json';
import it from '../../locale/it.json';
import pt from '../../locale/pt.json';
import ko from '../../locale/ko.json';
import zhCn from '../../locale/zh_CN.json';
import id from '../../locale/id.json';
import ar from '../../locale/ar.json';
import lt from '../../locale/lt.json';
import ms from '../../locale/ms.json';

const resources = {
	en: {
		translation: en
	},
	es: {
		translation: es
	},
	ru: {
		translation: ru
	},
	de: {
		translation: de
	},
	hi: {
		translation: hi
	},
	it: {
		translation: it
	},
	pt: {
		translation: pt
	},
	ko: {
		translation: ko
	},
	zh_CN: {
		translation: zhCn
	},
	id: {
		translation: id
	},
	ar: {
		translation: ar
	},
	lt: {
		translation: lt
	},
	ms: {
		translation: ms
	}
};

i18n
	.use(initReactI18next)
	.init({
		resources,
		lng: 'en',
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false
		}
	});

export default i18n;