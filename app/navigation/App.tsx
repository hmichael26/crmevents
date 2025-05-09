import React, { useEffect, useState, useContext } from 'react'
import { StatusBar, Platform, Text } from 'react-native'
import {
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { AuthContext, AuthProvider } from '../context/AuthContext'
import { useData } from '../hooks'
import { Login } from '../screens'
import ModernSplashScreen from '../screens/ModernSplashScreen'
import Menu from './Menu'
import { initializeI18n } from '../constants/translations'

// Empêche le splash auto tant que fonts ne sont pas chargées
SplashScreen.preventAutoHideAsync()

const Stack = createNativeStackNavigator()

const SecureNavigator = () => {
  const { usertoken, userdata, isLoading } = useContext(AuthContext)

  if (isLoading) {
    return <ModernSplashScreen />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usertoken ? (
        <Stack.Screen name="Menu" component={Menu} />
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  )
}

const App = () => {
  const { isDark, theme, setTheme } = useData()
  const [isReady, setIsReady] = useState(false)

  const [fontsLoaded] = useFonts({
    'OpenSans-Light': require('../assets/fonts/OpenSans-Light.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-SemiBold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
    'OpenSans-ExtraBold': require('../assets/fonts/OpenSans-ExtraBold.ttf'),
    'OpenSans-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
  })

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await initializeI18n()

        if (fontsLoaded) {
          await SplashScreen.hideAsync()
          setIsReady(true)
        }
      } catch (error) {
        console.error('Erreur init app :', error)
        setIsReady(true) // au cas où
      }
    }

    prepareApp()
  }, [fontsLoaded])

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true)
    }
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content')
    return () => {
      StatusBar.setBarStyle('default')
    }
  }, [isDark])

  if (!isReady) {
    return <ModernSplashScreen />
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
  }

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <SecureNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
