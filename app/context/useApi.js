import { useState } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
const API_URL = 'https://www.goseminaire.com/crm/api/api.php';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { usertoken } = useContext(AuthContext);

    const makeRequest = async (action, data = {}, customConfig = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Fusionner les données avec l'action
            const apiData = {
                action,
                token: usertoken,
                ...data
            };

            // Configuration par défaut
            const defaultConfig = {
                method: 'post',
                url: API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }

            };

            // Fusionner avec la configuration personnalisée
            const config = {
                ...defaultConfig,
                ...customConfig,
                headers: {
                    ...defaultConfig.headers,
                    ...(customConfig.headers || {})
                },
                data: apiData
            };

            const response = await axios.request(config);
            return response.data;

        } catch (err) {
            setError(err);
            console.error(`Erreur API (${action}):`, err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fonctions d'aide prédéfinies pour les actions communes
    const getPrestaBy = (data) => makeRequest('get-presta-by', data);
    const getDerouler = (data) => makeRequest('get-deroule', data);
    const getUserData = (data) => makeRequest('get-presta-prms', data);

    // Ajoutez d'autres actions communes ici

    return {
        loading,
        error,
        makeRequest,
        // Actions prédéfinies
        getPrestaBy,
        getDerouler,
        getUserData

        // ... autres actions
    };
};