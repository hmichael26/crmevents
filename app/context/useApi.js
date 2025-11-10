import { useState } from 'react'
import axios from 'axios'
import { useContext } from 'react'
import { AuthContext } from './AuthContext'
const API_URL = 'https://www.goseminaire.com/crm/api/api.php'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { usertoken } = useContext(AuthContext)

  const makeRequest = async (action, data = {}, customConfig = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Fusionner les données avec l'action
      const apiData = {
        action,
        token: usertoken,
        ...data,
      }

      // Configuration par défaut
      const defaultConfig = {
        method: 'post',
        url: API_URL,
        timeout: 70000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }

      // Fusionner avec la configuration personnalisée
      const config = {
        ...defaultConfig,
        ...customConfig,
        headers: {
          ...defaultConfig.headers,
          ...(customConfig.headers || {}),
        },
        data: apiData,
      }

      const response = await axios.request(config)
      return response.data
    } catch (err) {
      setError(err)
      console.error(`Erreur API (${action}):`, err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fonctions d'aide prédéfinies pour les actions communes
  const getPrestaBy = (data) => makeRequest('get-presta-by', data)
  const getClientBy = (data) => makeRequest('get-client-by', data)
  const getDerouler = (data) => makeRequest('get-deroule', data)
  const getUserData = (data) => makeRequest('get-presta-prms', data)
  const updatepresta = (data) => makeRequest('save-presta', data)
  const updateClient = (data) => makeRequest('save-client', data)
  const deletepresta = (data) => makeRequest('delete-presta', data)
  const deleteClient = (data) => makeRequest('delete-client', data)
  const getprestaprms = (data) => makeRequest('get-presta-prms', data)
  const getClientPrms = (data) => makeRequest('get-client-prms', data)
  const validdevis = (data) => makeRequest('valid-devis', data)
  const validbrochure = (data) => makeRequest('valid-brochure', data)
  const sendDemande = (data) => makeRequest('send-demand', data)
  const sendDemandes = (data) => makeRequest('send-all-demand', data)
  const getUserDatas = (data) => makeRequest('get-user-data', data)
  const getevent = (data) => makeRequest('get-event', data)
  const deletePresta = (data) => makeRequest('del-presta-interroge', data)
  const searchPresta = (data) => makeRequest('search-presta', data)
  const assignPresta = (data) => makeRequest('assign-presta', data)
  const sendPouce = (data) => makeRequest('send-pouce', data)
  const getChatList = (data) => makeRequest('get-chat-list', data)
  const getChat = (data) => makeRequest('get-chat', data)
  const sendChat = (data) => makeRequest('send-chat', data)
  const createDerouler = (data) => makeRequest('create-deroule', data)
  const getClient = (data) => makeRequest('search-client', data)
  const udpateClient = (data) => makeRequest('update-client', data)
  const updateSelect = (data) => makeRequest('update-statut', data)
  const getProjetcs = (data) => makeRequest('get-projects', data)

  //   const addPresta = (data) => makeRequest('add-presta-interroge', data);

  // Ajoutez d'autres actions communes ici

  return {
    loading,
    error,
    makeRequest,
    // Actions prédéfinies
    getPrestaBy,
    getClientBy,
    getDerouler,
    getUserData,
    updatepresta,
    updateClient,
    deletepresta,
    deleteClient,
    getprestaprms,
    getClientPrms,
    validdevis,
    validbrochure,
    sendDemande,
    getUserDatas,
    getevent,
    deletePresta,
    searchPresta,
    assignPresta,
    sendPouce,
    getChatList,
    getChat,
    sendChat,
    createDerouler,

    // Autres actions
    sendDemandes,
    getClient,
    udpateClient,
    updateSelect,
    getProjetcs,
    // ... autres actions
  }
}
