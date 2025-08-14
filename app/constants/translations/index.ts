import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en.json';
import fr from './fr.json';

// CORRECTION: Fonction pour obtenir la langue de manière sécurisée
const getDeviceLanguage = () => {
  try {
    // Vérifier si Localization.locale existe et est une string
    const locale = Localization.locale;

    console.log('🌍 Locale détectée:', locale, 'Type:', typeof locale);

    if (!locale || typeof locale !== 'string') {
      console.warn('⚠️ Locale invalide, utilisation du fallback "en"');
      return 'en';
    }

    // Extraire la langue principale (fr-FR -> fr)
    const language = locale.split('-')[0];

    // Vérifier que la langue est supportée
    const supportedLanguages = ['en', 'fr'];
    if (supportedLanguages.includes(language)) {
      console.log('✅ Langue supportée:', language);
      return language;
    }

    console.log('🔄 Langue non supportée, fallback vers "en"');
    return 'en';

  } catch (error) {
    console.error('❌ Erreur détection langue:', error);
    return 'en'; // Fallback sécurisé
  }
};

export const initializeI18n = async () => {
  try {
    const deviceLanguage = getDeviceLanguage();

    await i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          fr: { translation: fr },
        },
        lng: deviceLanguage, // Utiliser la fonction sécurisée
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        // Options supplémentaires pour plus de robustesse
        debug: __DEV__, // Debug uniquement en développement
        keySeparator: false, // Permet d'utiliser des clés avec des points
        nsSeparator: false, // Désactive les namespaces avec ':'
      });

    console.log('✅ i18n initialisé avec succès avec la langue:', deviceLanguage);
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation i18n:', error);
    // En cas d'erreur, initialiser avec une config minimale
    try {
      await i18n.init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
          en: { translation: en },
        },
        interpolation: {
          escapeValue: false,
        },
      });
      console.log('⚠️ i18n initialisé en mode dégradé (English only)');
      return true;
    } catch (fallbackError) {
      console.error('❌ Impossible d\'initialiser i18n même en mode dégradé:', fallbackError);
      return false;
    }
  }
};

// Version synchrone si vous en avez besoin (pas recommandée)
export const initializeI18nSync = () => {
  try {
    const deviceLanguage = getDeviceLanguage();

    return i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          fr: { translation: fr },
        },
        lng: deviceLanguage,
        fallbackLng: 'fr',
        interpolation: {
          escapeValue: false,
        },
      });
  } catch (error) {
    console.error('❌ Erreur initializeI18nSync:', error);
    throw error;
  }
};

// Export de la détection de langue pour usage externe si besoin
export { getDeviceLanguage };