import React, { createContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { debounce } from 'lodash';

export const AuthContext = createContext();

// Configuration axios
const axiosInstance = axios.create({
  baseURL: 'https://www.goseminaire.com/crm/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const AuthProvider = ({ children }) => {
  const [userdata, setUserData] = useState(null);
  const [presta, setPresta] = useState(null);
  const [isloading, setIsLoading] = useState(false);
  const [usertoken, setUserToken] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const debouncedSetLoading = debounce(setIsLoading, 300);

  // Utilitaire de stockage sécurisé
  const StoreSave = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('StoreSave error:', error);
    }
  };

  const StoreDelete = async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('StoreDelete error:', error);
    }
  };

  const StoreGet = async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('StoreGet error:', error);
      return null;
    }
  };

  // Fonction API optimisée
  const ApiAction = useCallback(async (params, callback, errorCallback, headers = {}) => {
    try {
      debouncedSetLoading(true);

      const config = {
        headers: {
          ...axiosInstance.defaults.headers,
          ...headers,
          ...(usertoken && { Authorization: `Bearer ${usertoken}` })
        }
      };

      const response = await axiosInstance.post('api.php', params, config);

      switch (response.data.code) {
        case 'SUCCESS':
          callback?.(response);
          break;
        case 'LOGOUT':
          await Logout();
          break;
        default:
          if (errorCallback) {
            errorCallback(response.data);
          } else {
            console.error('API Error:', response.data);
            throw new Error(response.data.message || 'Une erreur est survenue');
          }
      }

      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      if (errorCallback) {
        errorCallback(error);
      } else {
        alert(`Erreur de connexion : ${error.message}`);
      }
      throw error;
    } finally {
      debouncedSetLoading(false);
    }
  }, [usertoken]);

  // Login optimisé
  const Login = async (data) => {
    try {
      const response = await ApiAction({
        email: data.email,
        action: 'login-api',
        password: data.password,
      }, async (res) => {


        const { data, token, user } = res.data;

        setUserData(data);
        setUserToken(token);
        await StoreSave("usertoken", token);
      });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Fonction getUserData optimisée
  const getUserData = useCallback(async () => {
    try {
      const token = await StoreGet("usertoken");
      if (!token) {
        throw new Error('No token found');
      }

      const response = await ApiAction({
        action: 'get-user-data',
        token
      }, async (res) => {
        const userData = res.data.data;
        setUserData(userData);
        return userData;
      });

      return response.data.data;
    } catch (error) {
      console.error('GetUserData error:', error);
      throw error;
    }
  }, [ApiAction]);

  // Fonction validForm optimisée
  const validForm = async (data, callback) => {
    try {
      const formData = {
        ...data,
        action: 'save-all-datas',
        token: usertoken
      };

      await ApiAction(formData, async () => {
        await getUserData();
        alert('Formulaire envoyé avec succès');
        callback?.();
      });
    } catch (error) {
      console.error('ValidForm error:', error);
      throw error;
    }
  };

  // Fonction validFormMultiPart optimisée
  const validFormMultiPart = async (data, callback) => {
    if (!(data instanceof FormData)) {
      throw new Error('Data must be a FormData object');
    }

    try {
      await ApiAction(data,
        (res) => {
          callback?.(res.data);
          alert('Formulaire envoyé avec succès');
        },
        undefined,
        { 'Content-Type': 'multipart/form-data' }
      );
    } catch (error) {
      console.error('ValidFormMultiPart error:', error);
      throw error;
    }
  };

  // Fonction getAllPrestaData optimisée
  const getAllPrestaData = useCallback(async (data) => {
    try {
      const response = await ApiAction({
        action: 'get-presta-by',
        token: usertoken,
        ...data
      }, (res) => {
        setPresta(res.data.data);
        return res.data.data;
      });
      return response.data.data;
    } catch (error) {
      console.error('GetAllPrestaData error:', error);
      throw error;
    }
  }, [usertoken, ApiAction]);

  // Fonction Logout optimisée
  const Logout = useCallback(async () => {
    try {
      setUserToken(null);
      setUserData(null);
      setIsLoading(false);
      await StoreDelete("usertoken");
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  // Initialisation des données au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await StoreGet("usertoken");
        if (storedToken) {
          setUserToken(storedToken);
          await getUserData();
        }
      } catch (error) {
        console.error('Initialize Auth error:', error);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userdata,
        isloading,
        usertoken,
        isConnected,
        setIsConnected,
        setUserData,
        Login,
        Logout,
        getUserData,
        validForm,
        validFormMultiPart,
        getAllPrestaData,
        presta
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
