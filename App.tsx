import './app/constants/translations'

import 'react-native-gesture-handler'
import { Alert, ToastAndroid } from 'react-native'
import * as Clipboard from 'expo-clipboard'

import React, { useEffect, useRef, useState } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'

import { DataProvider } from './app/hooks'
import AppNavigation from './app/navigation/App'
import { View, Text, Image, StyleSheet, FlatList } from 'react-native'
import Menu from './app/navigation/Menu'
import 'intl-pluralrules'
import Constants from 'expo-constants'
import { LogBox } from 'react-native'
import Toast from 'react-native-toast-message'
import * as eva from '@eva-design/eva'
import { ApplicationProvider } from '@ui-kitten/components'
import { KeyboardProvider } from 'react-native-keyboard-controller'

LogBox.ignoreAllLogs() // si tu veux ignorer les warnings

// Pour capturer les erreurs globales :
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log('❌ Erreur non capturée : ', error, 'Fatal: ', isFatal)
})
SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('')
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  )
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined)
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token),
    )

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? []),
      )
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification)
      },
    )

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response)
      },
    )

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        )
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  return (
    <>
      <ApplicationProvider {...eva} theme={eva.light}>
        <DataProvider>
          <AppNavigation />
        </DataProvider>
        <Toast />
      </ApplicationProvider>
    </>
  )
}

// Dans votre App.js ou service de notifications
const registerForPushNotificationsAsync = async () => {
  try {
    // Vérifier si nous sommes dans un environnement approprié (pas Expo Go)
    if (!Device.isDevice) {
      console.log(
        'Doit utiliser un appareil physique pour les notifications push',
      )
      return null
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#A127417C',
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log("Échec de l'obtention du token push pour les notifications !")
      return null
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId

    if (!projectId) {
      throw new Error('Project ID non trouvé dans la configuration')
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data
    console.log('Token push obtenu:', token)
    return token
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des notifications:", error)
    return null
  }
}

export async function schedulePushNotification() {
  await Notifications.setNotificationChannelAsync('new_emails', {
    name: 'E-mail notifications',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'mySoundFile.wav', // Provide ONLY the base filename
  })
}
