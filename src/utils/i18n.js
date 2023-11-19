import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from '../../locale/en.json';
import es from '../../locale/es.json';
import ru from '../../locale/ru.json';
import am from '../../locale/am.json';
import de from '../../locale/de.json';
import hi from '../../locale/hi.json';
import it from '../../locale/it.json';
import pt from '../../locale/pt.json';

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
  am: {
    translation: am
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
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;