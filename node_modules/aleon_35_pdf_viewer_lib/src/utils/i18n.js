import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from '../../locale/en.json';
import es from '../../locale/es.json';
import ru from '../../locale/ru.json';

const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  },
  ru: {
    translation: ru
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