import './app/constants/translations'

import 'react-native-gesture-handler'
import { Alert, ToastAndroid } from 'react-native'
import * as Clipboard from 'expo-clipboard'

import React, { useEffect, useRef, useState, createContext, useContext } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import * as TaskManager from 'expo-task-manager'

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

// 🆕 Créer un contexte pour le token push
interface PushTokenContextType {
  expoPushToken: string
}

const PushTokenContext = createContext<PushTokenContextType>({ expoPushToken: '' })

export const usePushToken = () => useContext(PushTokenContext)

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

// 🆕 Définir le nom de la tâche en arrière-plan
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK'

// 🆕 Définir la tâche en arrière-plan pour les notifications
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
  console.log('🔔 Background notification task triggered!')
  console.log('📦 Data:', data)
  console.log('⚙️ Execution info:', executionInfo)
  
  if (error) {
    console.error('❌ Background task error:', error)
    return
  }

  if (data) {
    const notification = data as any
    console.log('📬 Background notification received:', notification)
    
    // Vous pouvez ajouter ici une logique personnalisée
    // Par exemple: sauvegarder dans AsyncStorage, mettre à jour un badge, etc.
    
    // Note: Vous ne pouvez PAS naviguer directement depuis une tâche en arrière-plan
    // La navigation se fera quand l'utilisateur tapera sur la notification
  }
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

    // 🆕 Enregistrer la tâche en arrière-plan pour les notifications
    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK)
      .then(() => {
        console.log('✅ Background notification task registered')
      })
      .catch((error) => {
        console.error('❌ Error registering background task:', error)
      })

    // 🆕 Vérifier si l'app a été ouverte par une notification (état fermé)
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          console.log('🔔 App ouverte depuis une notification (état fermé):', response)
          handleNotificationResponse(response)
        }
      })
      .catch((error) => {
        console.error('❌ Erreur getLastNotificationResponseAsync:', error)
      })

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification)
      },
    )

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('📱 Notification Response (app active/background):', response)
        handleNotificationResponse(response)
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

  // 🆕 Fonction centralisée pour gérer la navigation depuis les notifications
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
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
        
        // Fonction pour effectuer la navigation
        const performNavigation = () => {
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
        }

        // 🆕 Fonction de retry améliorée pour attendre que la navigation soit prête
        const waitForNavigationAndPerform = (attempt = 1, maxAttempts = 10) => {
          if (navigationRef.isReady()) {
            console.log(`✅ Navigation prête (tentative ${attempt})`)
            performNavigation()
          } else if (attempt < maxAttempts) {
            console.log(`⏳ Navigation non prête, tentative ${attempt}/${maxAttempts}...`)
            // Augmenter progressivement le délai: 500ms, 1s, 1.5s, 2s, etc.
            const delay = Math.min(attempt * 500, 3000)
            setTimeout(() => {
              waitForNavigationAndPerform(attempt + 1, maxAttempts)
            }, delay)
          } else {
            console.log('❌ Navigation toujours non prête après toutes les tentatives')
          }
        }

        // Implémenter la navigation avec retry
        if (navigationRef.isReady()) {
          performNavigation()
        } else {
          console.log('⚠️ Navigation non prête, démarrage du système de retry...')
          waitForNavigationAndPerform()
        }
      } else {
        console.log('⚠️ Pas de paramètre "screen" dans les données')
      }
    } else {
      console.log('⚠️ Aucune data dans la notification')
    }
  }

  return (
    <>
      <PushTokenContext.Provider value={{ expoPushToken }}>
        <ApplicationProvider {...eva} theme={eva.light}>
          <DataProvider>
            <AppNavigation />
          </DataProvider>
          <Toast />
        </ApplicationProvider>
      </PushTokenContext.Provider>
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


