import React, { createContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

export const AuthContext = createContext()

const axiosInstance = axios.create({
  baseURL: 'https://www.goseminaire.com/crm/api/',
  timeout: 70000, // Augmenté à 70 secondes pour les API lentes
  headers: {
    'Content-Type': 'application/json',
  },
})

export const AuthProvider = ({ children }) => {
  const [usertoken, setUserToken] = useState(null)
  const [userdata, setUserData] = useState(null)
  const [presta, setPresta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginProgress, setLoginProgress] = useState(null) // Pour suivre l'étape du login

  /** Utility Functions */
  const StoreSave = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch (error) {
      console.error('Error saving to SecureStore:', error)
    }
  }

  const StoreGet = async (key) => {
    try {
      return await SecureStore.getItemAsync(key)
    } catch (error) {
      console.error('Error getting from SecureStore:', error)
      return null
    }
  }

  const StoreDelete = async (key) => {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (error) {
      console.error('Error deleting from SecureStore:', error)
    }
  }

  /** Core Functions */

  // Initialize Authentication
  const initializeAuth = useCallback(async () => {
    try {
      const token = await StoreGet('usertoken')

      if (!token) {
        console.log('🔒 Aucun token trouvé, utilisateur non connecté.')
        setIsLoading(false)
        return
      }

      console.log('🔐 Token trouvé :', token)
      setUserToken(token)
      await getUserData(token)
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de l'authentification :",
        error,
      )
      setUserToken(null)
      setUserData(null)
      await StoreDelete('usertoken')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get User Data avec timeout étendu
  const getUserData = async (token) => {
    const data = {
      action: 'get-user-data',
      token,
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId

      if (!projectId || typeof projectId !== 'string') {
        console.warn(
          '🟡 projectId manquant ou invalide pour ExpoPushTokenAsync',
        )
      } else {
        const expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId,
        })
        if (expoPushToken?.data) {
          data.pushtoken = expoPushToken.data
          console.log('📩 Token push récupéré :', expoPushToken.data)
        }
      }
    } catch (e) {
      console.warn('⚠️ Erreur récup push token Expo :', e?.message || e)
    }

    try {
      console.log('📤 Récupération des données utilisateur...')

      // Requête avec timeout étendu pour cette API lente
      const response = await axiosInstance.post('api.php', data, {
        timeout: 70000, // Timeout spécifique pour cette requête
      })

      if (
        response.data.code === 'ERROR' &&
        response.data.data?.includes('utilisateur non reconnu')
      ) {
        console.error('Utilisateur non reconnu. Déconnexion en cours...')
        setUserToken(null)
        setUserData(null)
        await StoreDelete('usertoken')
        return
      }

      setUserData(response.data.data)
      console.log('✅ Données utilisateur récupérées avec succès')
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Timeout - La requête a pris trop de temps')
        throw new Error(
          'La connexion prend plus de temps que prévu. Veuillez réessayer.',
        )
      }
      console.error('❌ Erreur API getUserData :', error)
      setUserToken(null)
      setUserData(null)
      throw error
    }
  }

  // Login optimisé avec étapes de progression
  const Login = async ({ email, password }) => {
    setIsLoading(true)
    setLoginProgress('Connexion en cours...')

    try {
      // Étape 1: Authentification
      setLoginProgress('Vérification des identifiants...')
      console.log('🔐 Tentative de connexion pour:', email)

      const response = await axiosInstance.post(
        'api.php',
        {
          email,
          password,
          action: 'login-api',
        },
        {
          timeout: 30000, // Timeout plus court pour le login initial
        },
      )

      const { token } = response.data

      if (!token) {
        throw new Error('Aucun token reçu. Veuillez vérifier vos identifiants.')
      }

      // Étape 2: Sauvegarde du token
      setLoginProgress('Sauvegarde de la session...')
      setUserToken(token)
      await StoreSave('usertoken', token)
      console.log('💾 Token sauvegardé')

      // Étape 3: Récupération des données utilisateur (peut être lente)
      setLoginProgress('Chargement de vos données...')
      console.log('📥 Récupération des données utilisateur...')

      await getUserData(token)

      setLoginProgress('Connexion réussie !')
      console.log('✅ Connexion terminée avec succès')
    } catch (error) {
      console.error('❌ Erreur lors de la connexion :', error)

      // Messages d'erreur plus explicites
      if (error.code === 'ECONNABORTED') {
        throw new Error(
          'La connexion prend trop de temps. Vérifiez votre connexion internet et réessayez.',
        )
      } else if (
        error.message.includes('Network Error') ||
        error.message.includes('timeout')
      ) {
        throw new Error('Problème de connexion réseau. Veuillez réessayer.')
      } else {
        throw new Error(
          error.message || 'Échec de la connexion. Vérifiez vos identifiants.',
        )
      }
    } finally {
      setIsLoading(false)
      setLoginProgress(null)
    }
  }

  // Login en arrière-plan (pour après la première connexion)
  const LoginBackground = async ({ email, password }) => {
    try {
      console.log('🔄 Connexion en arrière-plan...')

      const response = await axiosInstance.post('api.php', {
        email,
        password,
        action: 'login-api',
      })

      const { token } = response.data

      if (token) {
        setUserToken(token)
        await StoreSave('usertoken', token)

        // Récupération des données en arrière-plan sans bloquer l'UI
        getUserData(token).catch(console.error)

        return { success: true }
      }
    } catch (error) {
      console.error('Erreur connexion arrière-plan:', error)
      return { success: false, error: error.message }
    }
  }

  // Logout
  const Logout = async () => {
    setIsLoading(true)
    try {
      setUserToken(null)
      setUserData(null)
      setPresta(null)
      await StoreDelete('usertoken')
      console.log('👋 Déconnexion réussie')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Submit Form Data avec retry
  const validForm = async (data, callback, retryCount = 0) => {
    try {
      const formData = {
        ...data,
        action: 'save-all-datas',
        token: usertoken,
      }

      const response = await axiosInstance.post('api.php', formData, {
        timeout: 70000, // Timeout étendu
      })

      if (response.data.code === 'SUCCESS') {
        await getUserData(usertoken)
        callback?.()

        return response.data
      } else {
        throw new Error(response.data.message || 'Error submitting form')
      }
    } catch (error) {
      // Retry une fois en cas de timeout
      if (error.code === 'ECONNABORTED' && retryCount === 0) {
        console.log('⏱️ Timeout, tentative de retry...')
        return validForm(data, callback, 1)
      }

      console.error('ValidForm error:', error)
      throw error
    }
  }

  // Submit Multipart Form Data
  const validFormMultiPart = async (data, callback) => {
    if (!(data instanceof FormData)) {
      throw new Error('Data must be a FormData object')
    }
    try {
      const response = await axiosInstance.post('api.php', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // Timeout plus long pour les uploads
      })

      if (response.data.code === 'SUCCESS') {
        callback?.(response.data)
      } else {
        throw new Error(
          response.data.message || 'Error submitting multipart form',
        )
      }
    } catch (error) {
      console.error('ValidFormMultiPart error:', error)
      throw error
    }
  }

  // Get All Presta Data
  const getAllPrestaData = useCallback(
    async (params) => {
      try {
        const response = await axiosInstance.post(
          'api.php',
          {
            action: 'get-presta-by',
            token: usertoken,
            ...params,
          },
          {
            timeout: 70000,
          },
        )

        setPresta(response.data.data)
        return response.data.data
      } catch (error) {
        console.error('GetAllPrestaData error:', error)
        throw error
      }
    },
    [usertoken],
  )

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <AuthContext.Provider
      value={{
        usertoken,
        userdata,
        isLoading,
        loginProgress, // Nouveau: pour afficher l'étape actuelle du login
        presta,
        Login,
        LoginBackground, // Nouveau: pour les connexions en arrière-plan
        Logout,
        getUserData,
        validForm,
        validFormMultiPart,
        getAllPrestaData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
