import React, { createContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications'

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
      if (token) {
        setUserToken(token)
        await getUserData(token)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get User Data
  const getUserData = async (token, pushtoken) => {
    data = {
      action: 'get-user-data',
      token,
    }

    pushtoken = await Notifications.getExpoPushTokenAsync()

    if (pushtoken) {
      data.pushtoken = pushtoken.data
    }
    try {
      console.log(data)
      const response = await axiosInstance.post('api.php', data)

      if (
        response.data.code === 'ERROR' &&
        response.data.data.includes('utilisateur non reconnu')
      ) {
        console.error('Utilisateur non reconnu. Déconnexion en cours...')
        setUserToken(null)
        setUserData(null)
        await StoreDelete('usertoken')
        return // Arrête l'exécution ici
      }

      // console.log(response.data.data);
      setUserData(response.data.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserToken(null)
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

      if (token) {
        setUserToken(token)
        await StoreSave('usertoken', token)

        // Appelle directement getUserData
        await getUserData(token)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Login failed. Check your credentials.')
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
