import React, { createContext, useContext, useState, useEffect } from 'react'
import { navigationRef } from '../../App'

interface NotificationData {
  screen: string
  receiver_name?: string
  isForClient?: boolean
  idevt?: string
  from_user?: string
  to_user?: string
  item?: any
  onSuccess?: () => void // 🆕 Callback appelé après navigation réussie
  [key: string]: any
}

interface PendingNotificationContextType {
  notificationQueue: NotificationData[]
  addNotification: (data: NotificationData, onSuccess?: () => void) => void
  processNextNotification: (isAuthenticated: boolean) => void
  clearQueue: () => void
}

const PendingNotificationContext = createContext<PendingNotificationContextType>({
  notificationQueue: [],
  addNotification: () => {},
  processNextNotification: () => {},
  clearQueue: () => {},
})

export const usePendingNotification = () => useContext(PendingNotificationContext)

export const PendingNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 🆕 File d'attente de notifications (au lieu d'une seule)
  const [notificationQueue, setNotificationQueue] = useState<NotificationData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [shouldAutoProcess, setShouldAutoProcess] = useState(false)

  // Fonction pour ajouter une notification à la file
  const addNotification = (data: NotificationData, onSuccess?: () => void) => {
    console.log('📥 Ajout notification à la file:', data)
    
    // 🆕 Ajouter le callback onSuccess aux données
    const notificationWithCallback = { ...data, onSuccess }
    
    let wasAdded = false
    setNotificationQueue((prev) => {
      // 🆕 Afficher le contenu actuel de la file AVANT vérification
      if (prev.length > 0) {
        console.log('📋 File actuelle avant ajout:')
        prev.forEach((notif, index) => {
          console.log(`   [${index + 1}] ${notif.screen} - idevt:${notif.idevt} - from:${notif.from_user}`)
        })
      }
      
      // Éviter les doublons
      const exists = prev.some(
        (n) => n.screen === data.screen && n.idevt === data.idevt && n.from_user === data.from_user
      )
      if (exists) {
        console.log('⚠️ Notification déjà dans la file, ignorée')
        console.log('🔍 Doublon détecté pour:', {
          screen: data.screen,
          idevt: data.idevt,
          from_user: data.from_user
        })
        console.log('💡 La file contient déjà cette notification - elle devrait être traitée automatiquement')
        return prev
      }
      
      wasAdded = true
      const newQueue = [...prev, notificationWithCallback]
      
      // 🆕 Afficher le contenu complet de la file
      console.log('📬 File de notifications mise à jour:')
      console.log(`   Total: ${newQueue.length} notification(s)`)
      newQueue.forEach((notif, index) => {
        console.log(`   [${index + 1}] ${notif.screen} - ${notif.receiver_name || notif.item?.admin_id || 'N/A'}`)
      })
      
      return newQueue
    })
    
    // 🆕 Déclencher le traitement automatique après ajout
    if (wasAdded) {
      console.log('🔄 Déclenchement du traitement automatique...')
      setShouldAutoProcess(true)
    } else {
      // Si c'est un doublon, forcer le traitement quand même
      console.log('🔄 Doublon détecté, mais forçage du traitement...')
      setShouldAutoProcess(true)
    }
  }

  // Fonction pour vider la file
  const clearQueue = () => {
    console.log('🗑️ Vidage de la file de notifications')
    setNotificationQueue([])
    setIsProcessing(false)
  }

  // Fonction pour traiter la prochaine notification dans la file
  const processNextNotification = (isAuthenticated: boolean) => {
    if (notificationQueue.length === 0) {
      console.log('📭 File de notifications vide')
      setIsProcessing(false)
      return
    }

    if (!isAuthenticated) {
      console.log('⏳ Utilisateur non connecté - notifications en attente:', notificationQueue.length)
      return
    }

    if (isProcessing) {
      console.log('⏳ Traitement déjà en cours...')
      return
    }

    // Prendre la première notification de la file
    const notification = notificationQueue[0]
    console.log('✅ Traitement de la notification:', notification)
    console.log(`� Notifications restantes: ${notificationQueue.length - 1}`)

    setIsProcessing(true)

    // Fonction pour effectuer la navigation
    const performNavigation = () => {
      if (notification.screen === 'Chat' || notification.screen === 'Inbox') {
        console.log('🚀 Navigation vers Inbox')
        navigationRef.navigate('Screens' as never, {
          screen: 'Inbox',
          params: {
            Receiver: notification.receiver_name || 'Conversation',
            isForClient: notification.isForClient || false,
            chat: {
              idevt: notification.idevt,
              from_user: notification.from_user,
              to_user: notification.to_user,
            },
          },
        } as never)

        // 🆕 Appeler le callback onSuccess si présent
        if (notification.onSuccess) {
          notification.onSuccess()
        }
        
        // Retirer la notification traitée de la file
        removeFirstNotification()
      } else if (notification.screen === 'InboxClient') {
        console.log('🚀 Navigation vers InboxClient')
        navigationRef.navigate('Screens' as never, {
          screen: 'InboxClient',
          params: {
            item: notification.item,
          },
        } as never)

        // 🆕 Appeler le callback onSuccess si présent
        if (notification.onSuccess) {
          notification.onSuccess()
        }
        
        // Retirer la notification traitée de la file
        removeFirstNotification()
      } else {
        console.log(`⚠️ Écran "${notification.screen}" non géré`)
        removeFirstNotification()
      }
    }

    // Navigation directe si prête, sinon attendre
    if (navigationRef.isReady()) {
      performNavigation()
    } else {
      console.log('⏳ Navigation non prête, attente...')
      // Un seul retry après 1 seconde
      setTimeout(() => {
        if (navigationRef.isReady()) {
          performNavigation()
        } else {
          console.log('❌ Navigation toujours non prête, notification ignorée')
          removeFirstNotification()
        }
      }, 1000)
    }
  }

  // Fonction helper pour retirer la première notification
  const removeFirstNotification = () => {
    setNotificationQueue((prev) => {
      const newQueue = prev.slice(1)
      console.log('🗑️ Notification consommée')
      console.log(`📊 Notifications restantes: ${newQueue.length}`)
      return newQueue
    })
    setIsProcessing(false)
  }

  // Surveiller les changements de la file
  useEffect(() => {
    if (notificationQueue.length > 0) {
      console.log(`📬 File de notifications: ${notificationQueue.length} en attente`)
    }
  }, [notificationQueue])

  // 🆕 Traitement automatique quand shouldAutoProcess est activé
  useEffect(() => {
    if (shouldAutoProcess && notificationQueue.length > 0) {
      console.log('⚡ Auto-traitement activé, tentative de traitement...')
      setShouldAutoProcess(false)
      
      // Attendre un peu pour que l'état soit mis à jour
      setTimeout(() => {
        processNextNotification(true)
      }, 300)
    }
  }, [shouldAutoProcess, notificationQueue])

  return (
    <PendingNotificationContext.Provider
      value={{
        notificationQueue,
        addNotification,
        processNextNotification,
        clearQueue,
      }}
    >
      {children}
    </PendingNotificationContext.Provider>
  )
}
