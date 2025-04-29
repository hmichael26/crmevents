import React, { useEffect, useState, useContext } from 'react'
import { StatusBar, Platform } from 'react-native'
import {
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { AuthContext, AuthProvider } from '../context/AuthContext'
import { useData } from '../hooks'
import { Login } from '../screens'
import ModernSplashScreen from '../screens/ModernSplashScreen'
import Menu from './Menu'
import { initializeI18n } from '../constants/translations'

SplashScreen.preventAutoHideAsync()

const Stack = createNativeStackNavigator()

const SecureNavigator = () => {
  const { usertoken, isLoading } = useContext(AuthContext)

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <ModernSplashScreen
        onAnimationEnd={() => {
          SplashScreen.hideAsync()
        }}
      />
    )
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
  const { isDark, theme } = useData()
  const [appIsReady, setAppIsReady] = useState(false)

  const [fontsLoaded] = useFonts({
    'OpenSans-Light': require('../assets/fonts/OpenSans-Light.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-SemiBold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
    'OpenSans-ExtraBold': require('../assets/fonts/OpenSans-ExtraBold.ttf'),
    'OpenSans-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
  })

  useEffect(() => {
    async function prepare() {
      try {
        // Tu peux aussi charger d'autres choses ici
        await initializeI18n()
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [appIsReady, fontsLoaded])

  if (!appIsReady || !fontsLoaded) {
    return null // Ne rien afficher tant que tout n'est pas prêt
  }

  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <NavigationContainer theme={theme}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
          <SecureNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
