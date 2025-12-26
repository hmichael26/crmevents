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
import AsyncStorage from '@react-native-async-storage/async-storage'

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

// 🆕 Importer le contexte de notification en attente
import { PendingNotificationProvider, usePendingNotification } from './app/context/PendingNotificationContext'

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
  
  return (
    <PendingNotificationProvider>
      <PushTokenContext.Provider value={{ expoPushToken }}>
        <AppContent expoPushToken={expoPushToken} setExpoPushToken={setExpoPushToken} />
      </PushTokenContext.Provider>
    </PendingNotificationProvider>
  )
}

interface AppContentProps {
  expoPushToken: string
  setExpoPushToken: (token: string) => void
}

// 🆕 Clé AsyncStorage pour les notifications traitées
const PROCESSED_NOTIFICATIONS_KEY = '@processed_notifications'

function AppContent({ expoPushToken, setExpoPushToken }: AppContentProps) {
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  )
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined)
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()
  
  // 🆕 Tracker pour éviter de retraiter les mêmes notifications
  // Utilise une clé métier au lieu de l'ID Expo pour permettre le retry
  const processedNotificationKeys = useRef<Set<string>>(new Set())
  
  // 🆕 Utiliser le contexte de notification en attente (file d'attente)
  const { addNotification, clearQueue } = usePendingNotification()

  // 🆕 Charger les clés traitées depuis AsyncStorage au démarrage
  useEffect(() => {
    const loadProcessedKeys = async () => {
      try {
        const stored = await AsyncStorage.getItem(PROCESSED_NOTIFICATIONS_KEY)
        if (stored) {
          const keys = JSON.parse(stored) as string[]
          processedNotificationKeys.current = new Set(keys)
          console.log(`📂 ${keys.length} notifications déjà traitées chargées depuis le stockage`)
        }
      } catch (error) {
        console.error('❌ Erreur chargement notifications traitées:', error)
      }
    }
    loadProcessedKeys()
  }, [])

  // 🆕 Fonction centralisée pour gérer la navigation depuis les notifications
  // IMPORTANT: Doit être définie AVANT le useEffect
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const notificationId = response.notification.request.identifier
    
    // Extraire les données de la notification
    const notificationData = response.notification.request.content.data
    
    console.log('🆔 Notification Expo ID:', notificationId)
    console.log('📦 Notification Data:', notificationData)
    
    // Vérifier si des données sont présentes
    if (notificationData && Object.keys(notificationData).length > 0) {
      console.log('✅ Data présente dans la notification')
      
      // Vérifier si un écran est spécifié
      if (notificationData.screen) {
        console.log(`🎯 Écran cible: ${notificationData.screen}`)
        console.log('📋 Paramètres:', notificationData)
        
        // 🆕 Utiliser l'ID Expo comme clé unique (chaque notification est unique)
        console.log('🔑 Clé unique:', notificationId)
        
        // 🆕 Vérifier si cette notification a déjà été traitée avec succès
        if (processedNotificationKeys.current.has(notificationId)) {
          console.log('⏭️ Notification déjà traitée avec succès, ignorée')
          return
        }
        
        // 🆕 Ajouter la notification à la file d'attente
        // Marquer comme traitée APRÈS navigation réussie
        addNotification(notificationData as any, async () => {
          console.log('✅ Navigation réussie, marquage de la notification comme traitée')
          processedNotificationKeys.current.add(notificationId)
          
          // 🆕 Sauvegarder dans AsyncStorage pour persistence
          try {
            const keys = Array.from(processedNotificationKeys.current)
            await AsyncStorage.setItem(PROCESSED_NOTIFICATIONS_KEY, JSON.stringify(keys))
            console.log(`💾 ${keys.length} notifications traitées sauvegardées`)
          } catch (error) {
            console.error('❌ Erreur sauvegarde notifications traitées:', error)
          }
        })
        
      } else {
        console.log('⚠️ Pas de paramètre "screen" dans les données')
      }
    } else {
      console.log('⚠️ Aucune data dans la notification')
    }
  }

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
    // IMPORTANT: Ceci est appelé UNE SEULE FOIS au démarrage
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
        console.log('📬 Notification reçue (foreground):', notification)
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
  }, [addNotification])

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


