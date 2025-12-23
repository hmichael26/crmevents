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
import { createNavigationContainerRef } from '@react-navigation/native'

// Créer une référence de navigation globale
export const navigationRef = createNavigationContainerRef()

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
        console.log('📱 Notification Response:', response)
        
        // Extraire les données de la notification
        const notificationData = response.notification.request.content.data
        
        console.log('📦 Notification Data:', notificationData)
        
        // Vérifier si des données sont présentes
        if (notificationData && Object.keys(notificationData).length > 0) {
          console.log('✅ Data présente dans la notification')
          
          // Vérifier si un écran est spécifié
          if (notificationData.screen) {
            console.log(`🎯 Navigation vers l'écran: ${notificationData.screen}`)
            console.log('📋 Paramètres:', notificationData)
            
            // Implémenter la navigation
            if (navigationRef.isReady()) {
              // Navigation vers Inbox (conversation directe)
              if (notificationData.screen === 'Chat' || notificationData.screen === 'Inbox') {
                console.log('🚀 Navigation vers Inbox avec les paramètres')
                navigationRef.navigate('Screens' as never, {
                  screen: 'Inbox',
                  params: {
                    Receiver: notificationData.receiver_name || 'Conversation',
                    isForClient: notificationData.isForClient || false,
                    chat: {
                      idevt: notificationData.idevt,
                      from_user: notificationData.from_user,
                      to_user: notificationData.to_user
                    }
                  }
                } as never)
              } 
              // Navigation vers InboxClient (liste des déroulés)
              else if (notificationData.screen === 'InboxClient') {
                console.log('🚀 Navigation vers InboxClient avec les paramètres')
                navigationRef.navigate('Screens' as never, {
                  screen: 'InboxClient',
                  params: {
                    item: notificationData.item
                  }
                } as never)
              } 
              else {
                console.log(`⚠️ Écran "${notificationData.screen}" non géré`)
              }
            } else {
              console.log('⚠️ Navigation non prête, attente...')
              // Attendre que la navigation soit prête
              setTimeout(() => {
                if (navigationRef.isReady()) {
                  if (notificationData.screen === 'Chat' || notificationData.screen === 'Inbox') {
                    navigationRef.navigate('Screens' as never, {
                      screen: 'Inbox',
                      params: {
                        Receiver: notificationData.receiver_name || 'Conversation',
                        isForClient: notificationData.isForClient || false,
                        chat: {
                          idevt: notificationData.idevt,
                          from_user: notificationData.from_user,
                          to_user: notificationData.to_user
                        }
                      }
                    } as never)
                  } else if (notificationData.screen === 'InboxClient') {
                    navigationRef.navigate('Screens' as never, {
                      screen: 'InboxClient',
                      params: {
                        item: notificationData.item
                      }
                    } as never)
                  }
                }
              }, 1000)
            }
          } else {
            console.log('⚠️ Pas de paramètre "screen" dans les données')
          }
        } else {
          console.log('⚠️ Aucune data dans la notification')
        }
      },
    )

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
      if (responseListener.current) {
        responseListener.current.remove()
      }
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
    if (!Device.isDevice) {
      console.log('Doit utiliser un appareil physique pour les notifications push')
      return null
    }

    // Configuration Android plus robuste
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#A127417C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      })

      // Canal pour les messages importants
      await Notifications.setNotificationChannelAsync('high-priority', {
        name: 'Messages Urgents',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF0000',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log("Échec de l'obtention du token push")
      return null
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId

    if (!projectId) {
      throw new Error('Project ID non trouvé')
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
    console.log('✅ Token push obtenu:', token)
    
    // Enregistrer le token sur votre serveur
    // await saveTokenToBackend(token)
    
    return token
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement des notifications:", error)
    return null
  }
}

// Fonction pour tester les notifications locales avec des données
export async function scheduleTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔔 Test Notification Client",
      body: "Cliquez pour ouvrir la conversation client",
      data: {
        screen: "Inbox",
        receiver_name: "Bruno PEREIRA - MERCEDES",
        isForClient: true,
        idevt: "10",
        from_user: "1",
        to_user: "12"
      },
    },
    trigger: null, // Notification immédiate
  })
  console.log('✅ Notification de test client envoyée')
}

// Fonction pour tester InboxClient (liste des déroulés)
export async function scheduleTestNotificationInboxClient() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔔 Test InboxClient",
      body: "Cliquez pour voir vos déroulés",
      data: {
        screen: "InboxClient",
        item: {
          admin_id: "1",
          arrderoules: [
            {
              id: "123",
              fk_evt: "10",
              titre_deroule: "Réception",
              comm_deroule: "Discussion sur la réception",
              numero_deroule: "1",
              titre_evt: "Mariage Bruno"
            },
            {
              id: "124",
              fk_evt: "10",
              titre_deroule: "Traiteur",
              comm_deroule: "Choix du menu",
              numero_deroule: "2",
              titre_evt: "Mariage Bruno"
            },
            {
              id: "125",
              fk_evt: "10",
              titre_deroule: "Décoration",
              comm_deroule: "Thème et ambiance",
              numero_deroule: "3",
              titre_evt: "Mariage Bruno"
            }
          ]
        }
      },
    },
    trigger: null,
  })
  console.log('✅ Notification de test InboxClient envoyée')
}
