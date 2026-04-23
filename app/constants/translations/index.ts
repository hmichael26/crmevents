import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// English
import enApp from './en/app.json';
import enCommon from './en/common.json';
import enExtras from './en/extras.json';
import enHome from './en/home.json';
import enLogin from './en/login.json';
import enMenu from './en/menu.json';
import enNavigation from './en/navigation.json';
import enNotifications from './en/notifications.json';
import enProfile from './en/profile.json';
import enRegister from './en/register.json';
import enRentals from './en/rentals.json';
import enScreens from './en/screens.json';
import enSettings from './en/settings.json';
import enShop from './en/shop.json';
import enDetails from './en/details.json';
import enClients from './en/clients.json';
import enPresta from './en/presta.json';
import enDates from './en/dates.json';
import enChat from './en/chat.json';
import enInbox from './en/inbox.json';

// French
import frApp from './fr/app.json';
import frCommon from './fr/common.json';
import frDates from './fr/dates.json';
import frExtras from './fr/extras.json';
import frHome from './fr/home.json';
import frLogin from './fr/login.json';
import frMenu from './fr/menu.json';
import frNavigation from './fr/navigation.json';
import frDetails from './fr/details.json';
import frClients from './fr/clients.json';
import frPresta from './fr/presta.json';
import frNotifications from './fr/notifications.json';
import frProfile from './fr/profile.json';
import frRegister from './fr/register.json';
import frRentals from './fr/rentals.json';
import frScreens from './fr/screens.json';
import frSettings from './fr/settings.json';
import frShop from './fr/shop.json';
import frChat from './fr/chat.json';
import frInbox from './fr/inbox.json';

const en = {
  app: enApp,
  common: enCommon,
  extras: enExtras,
  home: enHome,
  login: enLogin,
  menu: enMenu,
  navigation: enNavigation,
  notifications: enNotifications,
  profile: enProfile,
  register: enRegister,
  rentals: enRentals,
  screens: enScreens,
  settings: enSettings,
  shop: enShop,
  details: enDetails,
  clients: enClients,
  presta: enPresta,
  dates: enDates,
  chat: enChat,
  inbox: enInbox,
};

const fr = {
  app: frApp,
  common: frCommon,

  extras: frExtras,
  home: frHome,
  login: frLogin,
  menu: frMenu,
  navigation: frNavigation,
  notifications: frNotifications,
  profile: frProfile,
  register: frRegister,
  rentals: frRentals,
  screens: frScreens,
  settings: frSettings,
  shop: frShop,
  details: frDetails,
  clients: frClients,
  presta: frPresta,
  dates: frDates,
  chat: frChat,
  inbox: frInbox,
};

const getDeviceLanguage = () => {
  try {
    const locale = Localization.locale;
    if (!locale || typeof locale !== 'string') {
      return 'fr';
    }
    const language = locale.split('-')[0];
    const supportedLanguages = ['en', 'fr'];
    if (supportedLanguages.includes(language)) {
      return language;
    }
    return 'fr';
  } catch (error) {
    return 'fr';
  }
};

const deviceLanguage = getDeviceLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: deviceLanguage,
    fallbackLng: 'fr',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false, 
    },
    react: {
      useSuspense: false,
    },
  });

export const initializeI18n = async () => {
  return i18n;
};

export { getDeviceLanguage, i18n };
export default i18n;