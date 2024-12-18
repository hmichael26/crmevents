import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userdata, setUserData] = useState(null);
  const [isloading, setIsLoading] = useState(false);
  const [usertoken, setUserToken] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const appBaseUrl = 'https://www.goseminaire.com/crm/';

  const customHeaders = {
    'Content-Type': 'application/json',
    // ajoutez d'autres en-têtes nécessaires ici
  };

  async function StoreSave(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  async function AsyncSave(key, value) {
    await AsyncStorage.setItem(key, value);
  }

  const ApiAction = async (prms, callback, cberror, headers = {}, force = false, action = 'save-all-datas') => {
    setIsLoading(true);

    console.log('ApiAction params:', prms);
    console.log('Headers:', headers);


    console.log('CONNECTED ACTION ' + prms.action);
    axios.post(appBaseUrl + 'api/api.php', prms, { headers }).then((res) => {

      console.log(prms)
      setIsLoading(false);
      if (res.data.code == 'SUCCESS') callback(res);
      else if (res.data.code == 'LOGOUT') Logout();
      else if (cberror != undefined) cberror();
      else {
        console.log(res);
        alert(res);
      }
    }).catch((e) => {
      alert(`Erreur à la connexion : ${e}`);
      console.log(e);
      setIsLoading(false);
    });

  };

  const Login = data => {
    ApiAction({
      email: data.email,
      action: 'login-api',
      password: data.password,
    }, (res) => {
      console.log(res.data)
      setUserData(res.data.data);
      setUserToken(res.data.token);
      StoreSave("usertoken", res.data.token);
      AsyncSave("userdata", JSON.stringify(res.data.user));
    },
      undefined,
      customHeaders
    );
  };

  const validForm = (data, cb) => {
    /* data.append('token',usertoken);
     data.append('action','save-all-datas');  
      */

    data = { ...data, action: 'save-all-datas', token: usertoken };
    console.log(
      data
    )

    ApiAction(data, (res) => {
      // cb(res.data);

      alert('jai envoyer le formulaire');
    },
      undefined,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      });
  };


  const validFormMultiPart = (data, cb) => {

    if (!(data instanceof FormData)) {
      console.error('Data must be a FormData object');
      return;
    }


    ApiAction(
      data,
      (res) => {
        if (cb) cb(res.data);
        alert('Form submitted successfully');
      },
      (error) => {
        console.error('Form submission error:', error);
        alert('Failed to submit form');
      },
      {
        'Content-Type': 'multipart/form-data'
      }
    );
  };

  const getUserData = (token) => {
    ApiAction({
      action: 'get-user-data',
      token: token
    }, (res) => {
      setUserData(res.data.data);
      AsyncSave("userdata", JSON.stringify(res.data.data));
    });
  };

  const Logout = async () => {
    setUserToken(null);
    setUserData(null);
    setIsLoading(false);
    SecureStore.deleteItemAsync("usertoken");
    AsyncStorage.removeItem("userdata");
  };

  const getAsyncStoreData = (key) => {
    return AsyncStorage.getItem(key);
  };

  const getStoredData = async () => {
    try {
      let userinfo = await getAsyncStoreData("userdata");
      userinfo = JSON.parse(userinfo);
      if (userinfo) {
        setUserData(userinfo);
      }
    } catch (e) {
      console.log(`getStoredData #2 error : ${e}`);
    }

    try {
      var ut = await SecureStore.getItemAsync("usertoken");
      setUserToken(ut);
      if (ut != '' && ut != null && ut != 'undefined') {
        getUserData(ut);
      }
    } catch (e) {
      console.log(`getStoredData #1 error : ${e}`);
    }
  };

  useEffect(() => {
    // getStoredData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        appBaseUrl,
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
        validFormMultiPart
      }}>
      {children}
    </AuthContext.Provider>
  )
}
