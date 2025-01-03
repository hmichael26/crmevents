
import React, { useEffect, useContext, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import Menu from './Menu';
import Login from '../screens/Login';
import { useData, ThemeProvider } from '../hooks';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import ModernSplashScreen from '../screens/ModernSplashScreen';


const App = () => {
  const { isDark, theme, setTheme } = useData();
  const [isLoading, setIsLoading] = useState(true);



  const Stack = createNativeStackNavigator();




  const SecureNavigator = () => {
    const { usertoken, userdata, getUserData } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
      const loadUserData = async () => {
        try {
          //await getUserData();
          setIsError(false);
        } catch (error) {
          console.log('Error loading user data:', error);
          setIsError(true);
        } finally {
          setIsLoading(false);
        }
      };

      loadUserData();
    }, []);

    const handleFinish = () => {
      // Cette fonction est appelée quand l'animation du splash screen est terminée
      // On ne fait rien ici car le chargement est géré par loadUserData
    };

    if (isLoading) {
      return <ModernSplashScreen handleFinish={handleFinish} />;
    }

    // Si le chargement est terminé et qu'il n'y a pas d'erreur et qu'on a les données utilisateur
    if (!isLoading && !isError && userdata) {
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Menu" component={Menu} />
        </Stack.Navigator>
      );
    }

    // Si le chargement est terminé mais qu'il y a eu une erreur ou pas de données utilisateur
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    );
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, [isDark]);

  const [fontsLoaded] = useFonts({
    'OpenSans-Light': theme.assets.OpenSansLight,
    'OpenSans-Regular': theme.assets.OpenSansRegular,
    'OpenSans-SemiBold': theme.assets.OpenSansSemiBold,
    'OpenSans-ExtraBold': theme.assets.OpenSansExtraBold,
    'OpenSans-Bold': theme.assets.OpenSansBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      const hideSplash = async () => {
        await SplashScreen.hideAsync();
      };
      hideSplash();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      border: 'rgba(0,0,0,0)',
      text: String(theme.colors.text),
      card: String(theme.colors.card),
      primary: String(theme.colors.primary),
      notification: String(theme.colors.primary),
      background: String(theme.colors.background),
    },
  };




  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <SecureNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
