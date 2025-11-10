import React, { useEffect, useState, useContext, useCallback } from 'react'
import {
  StatusBar,
  Platform,
  Text,
  View,
  ActivityIndicator,
} from 'react-native'
import {
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { AuthContext, AuthProvider } from '../context/AuthContext'
import { useData, useTheme } from '../hooks'
import { Login } from '../screens'
import ModernSplashScreen from '../screens/ModernSplashScreen'
import Menu from './Menu'
import { initializeI18n } from '../constants/translations'

// Empêche le splash auto tant que fonts ne sont pas chargées
SplashScreen.preventAutoHideAsync()

const Stack = createNativeStackNavigator()

// Composant pour gérer l'état de chargement avec message personnalisé
const LoadingScreen = ({ message }) => {
  const { colors } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 40,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text
        style={{
          marginTop: 20,
          fontSize: 16,
          color: colors.text,
          textAlign: 'center',
          lineHeight: 24,
        }}
      >
        {message}
      </Text>
    </View>
  )
}

const SecureNavigator = () => {
  const { usertoken, userdata, isLoading, loginProgress } = useContext(
    AuthContext,
  )
  const [showDelayedMessage, setShowDelayedMessage] = useState(false)

  // Affiche un message si le chargement prend trop de temps
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowDelayedMessage(true)
      }, 5000) // Après 5 secondes

      return () => {
        clearTimeout(timer)
        setShowDelayedMessage(false)
      }
    }
  }, [isLoading])

  // Gestion des différents états de chargement
  if (isLoading) {
    // Si on a un message de progression du login, on l'affiche
    if (loginProgress) {
      return <LoadingScreen message={loginProgress} />
    }

    // Si ça prend du temps, on informe l'utilisateur
    if (showDelayedMessage) {
      return (
        <LoadingScreen message="Chargement en cours...  Merci de patienter." />
      )
    }

    // Écran de splash standard
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
  const [appInitProgress, setAppInitProgress] = useState('Initialisation...')
  const { colors } = useTheme()

  const [fontsLoaded, fontError] = useFonts({
    'OpenSans-Light': require('../assets/fonts/OpenSans-Light.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-SemiBold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
    'OpenSans-ExtraBold': require('../assets/fonts/OpenSans-ExtraBold.ttf'),
    'OpenSans-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
  })

  // Gestion des erreurs de polices
  if (fontError) {
    console.warn('Erreur de chargement des polices:', fontError)
  }

  const prepareApp = useCallback(async () => {
    try {
      setAppInitProgress('Chargement des traductions...')
      await initializeI18n()

      if (fontsLoaded) {
        setAppInitProgress('Finalisation...')
        await SplashScreen.hideAsync()

        // Petit délai pour que l'utilisateur voie le message de finalisation
        setTimeout(() => {
          setIsReady(true)
        }, 500)
      }
    } catch (error) {
      console.error('Erreur init app :', error)
      setAppInitProgress('Une erreur est survenue, but continuing...')
      setTimeout(() => {
        setIsReady(true)
      }, 1000)
    }
  }, [fontsLoaded])

  useEffect(() => {
    prepareApp()
  }, [prepareApp])

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true)
    }
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content')
    return () => {
      StatusBar.setBarStyle('default')
    }
  }, [isDark])

  // Écran de chargement de l'app avec progression
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
          <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
          <SecureNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
