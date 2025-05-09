import React, { createContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

export const AuthContext = createContext()

const axiosInstance = axios.create({
  baseURL: 'https://www.goseminaire.com/crm/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const AuthProvider = ({ children }) => {
  const [usertoken, setUserToken] = useState(null)
  const [userdata, setUserData] = useState(null)
  const [presta, setPresta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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

      // Essaye de récupérer les données utilisateur avec le token
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

  // Get User Data
  // Get User Data sécurisé
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
        } else {
          console.warn('🔕 Aucun token Expo récupéré')
        }
      }
    } catch (e) {
      console.warn(
        '⚠️ Erreur récup push token Expo (non bloquante) :',
        e?.message || e,
      )
    }

    try {
      console.log('📤 Données envoyées :', data)
      const response = await axiosInstance.post('api.php', data)

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
    } catch (error) {
      console.error('❌ Erreur API getUserData :', error)
      setUserToken(null)
      setUserData(null)
    }
  }

  /*// Login
  const Login = async ({ email, password }) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post('api.php', {
        email,
        password,
        action: 'login-api',
      })
      const { token, data } = response.data
      setUserToken(token)
      setUserData(data)
      await StoreSave('usertoken', token)
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Login failed. Check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }*/
  const Login = async ({ email, password }) => {
    setIsLoading(true)

    try {
      const response = await axiosInstance.post('api.php', {
        email,
        password,
        action: 'login-api',
      })

      const { token } = response.data

      if (!token) {
        throw new Error('Aucun token reçu. Veuillez vérifier vos identifiants.')
      }

      // Stocke le token en local
      setUserToken(token)
      await StoreSave('usertoken', token)

      // Récupère les données utilisateur + envoie le push token
      await getUserData(token)
    } catch (error) {
      console.error('Erreur lors de la connexion :', error)
      throw new Error('Échec de la connexion. Vérifiez vos identifiants.')
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const Logout = async () => {
    setIsLoading(true)
    try {
      setUserToken(null)
      setUserData(null)
      await StoreDelete('usertoken')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Submit Form Data
  const validForm = async (data, callback) => {
    try {
      const formData = {
        ...data,
        action: 'save-all-datas',
        token: usertoken,
      }
      const response = await axiosInstance.post('api.php', formData)
      if (response.data.code === 'SUCCESS') {
        await getUserData(usertoken)
        callback?.()
      } else {
        throw new Error(response.data.message || 'Error submitting form')
      }
    } catch (error) {
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
          // Authorization: `Bearer ${usertoken}`,
        },
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
        const response = await axiosInstance.post('api.php', {
          action: 'get-presta-by',
          token: usertoken,
          ...params,
        })
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
        presta,
        Login,
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
