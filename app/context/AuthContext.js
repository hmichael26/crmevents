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

  const ApiAction = async (prms, callback, cberror, headers = {}, force = false) => {
    setIsLoading(true);

    console.log('ApiAction params:', prms);
    console.log('Headers:', headers);

    if (!isConnected && !force) {
      console.log('DISCONNECTED ACTION');
      let obj = { type: '' };
      let curFilename = '';
      if (headers?.headers['Content-Type'].indexOf("multipart/form-data") > -1) {
        const action = prms._parts.find((part) => part[0] === 'action')[1];
        prms._parts.forEach((part) => {
          if (part[0].indexOf("doc") > -1) {
            curFilename += (curFilename != '' ? ',' : '') + part[1].uri;
          }
        });
      } else if (['send-rdv-step-quest', 'rdv-finish', 'save-satisfaction'].indexOf(prms.action) > -1) {
        obj.type = 'json';
        obj.data = prms;
      }

      if (obj.type != '') {
        try {
          let localData = await getAsyncStoreData("localData");
          localData = localData !== null ? JSON.parse(localData) : [];
          if (localData) {
            localData.push(obj);
            AsyncSave("localData", JSON.stringify(localData));

            localData = await getAsyncStoreData("localData");
            const resp = {};
            if (obj.type == 'formdata') resp.data = { filename: curFilename };

            callback(resp);
          }
        } catch (e) {
          console.log(`getStoredData #localData apiaction error : ${e}`);
        }
      } else if (['save-push-token'].indexOf(prms.action) == -1) alert('Vous ne pouvez pas faire cette operation, veuillez verifier votre connexion internet (' + prms.action + ')');

      setIsLoading(false);
    } else {
      console.log('CONNECTED ACTION (' + prms.action + ') ');
      axios.post(appBaseUrl + 'api/api.php', prms, { headers }).then((res) => {
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
        setIsLoading(false);
      });
    }
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
      }}>
      {children}
    </AuthContext.Provider>
  )
}
