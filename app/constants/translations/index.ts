// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Importez vos traductions
const resources = {
  en: {
    translation: require('./en.json')
  },
  fr: {
    translation: require('./fr.json')
  }
};

// Obtenir la langue du système
const getDeviceLanguage = () => {
  try {
    const locales = getLocales();
    return locales[0].languageCode; // Retourne 'fr', 'en', etc.
  } catch (error) {
    return 'fr'; // Langue par défaut en cas d'erreur
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Utilise la langue du système
    fallbackLng: 'fr',
    debug: __DEV__, // Active les logs uniquement en développement

    interpolation: {
      escapeValue: false
    },

    // Options importantes pour le chargement initial
    react: {
      useSuspense: false, // Désactive Suspense qui peut causer des problèmes au chargement
      bindI18n: 'languageChanged loaded', // Événements qui déclenchent un re-render
      bindStore: 'added removed', // Événements du store qui déclenchent un re-render
      nsMode: 'default'
    }
  });