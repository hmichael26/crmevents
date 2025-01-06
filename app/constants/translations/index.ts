import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en.json';
import fr from './fr.json';

export const initializeI18n = () => {
  return i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        fr: { translation: fr },
      },
      lng: Localization.locale.split('-')[0], // Détection automatique de la langue
      fallbackLng: 'en', // Langue par défaut
      interpolation: {
        escapeValue: false, // Pas besoin d'échappement dans React
      },
    });
};



/*
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en.json';
import fr from './fr.json';

export const initializeI18n = async () => {
  try {
    await i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          fr: { translation: fr },
        },
        lng: Localization.locale.split('-')[0],
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
    console.log('i18n initialized successfully');
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
};*/
