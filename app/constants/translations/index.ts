import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import fr from './fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      fr: {
        translation: fr
      }
    },
    lng: 'fr', // langue par défaut
    fallbackLng: 'en', // langue de secours
    interpolation: {
      escapeValue: false // react fait déjà l'échappement
    }
  });

export default i18n;