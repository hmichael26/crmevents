import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    debug: true, // Activez les logs
    resources: {
      en: {
        translation: require('./en.json')
      },
      fr: {
        translation: require('./fr.json')
      }
    }
    ,
    lng: 'fr', // langue par défaut
    fallbackLng: 'en', // langue de secours
    interpolation: {
      escapeValue: false // react fait déjà l'échappement
    }
  });

export default i18n;