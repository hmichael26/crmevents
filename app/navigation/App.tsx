import React, { useEffect, useContext } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import Menu from './Menu';
import Login from '../screens/Login';
import { useData, ThemeProvider } from '../hooks';
import { AuthContext, AuthProvider } from '../context/AuthContext';

const App = () => {
  const { isDark, theme, setTheme } = useData();

  const Stack = createNativeStackNavigator();

  const SecureNavigator = () => {
    const { usertoken, userdata } = useContext(AuthContext);
    console.log(usertoken)

    // if (false /*usertoken === null || usertoken === '' || userdata === null*/) {
    if ( usertoken === null || usertoken === '' || userdata === null) {

      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      );
    } else {
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Menu" component={Menu} />
        </Stack.Navigator>
      );
    }
  }

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
