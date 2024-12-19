import React, { useCallback, useContext, useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from './AuthContext';
import { useApi } from './useApi';
import { ProviderCard } from '../components/ProviderCard';

const PAGE_SIZE = 10;

const initialFormState = {
    region: '',
    department: '',
    city: '',
    providerType: '',
    postalCode: '',
    minRooms: '',
    maxRooms: '',
    nom: ''
};

// Hook personnalisé pour gérer le chargement des données
const useLocationData = (api) => {
    const [regions, setRegions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Charger les régions et catégories au démarrage
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [regionsResponse, categoriesResponse] = await Promise.all([
                    api.getRegions(),
                    api.getCategories()
                ]);
                setRegions(regionsResponse.data || []);
                setCategories(categoriesResponse.data || []);
            } catch (error) {
                console.error('Erreur lors du chargement des données initiales:', error);
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    // Charger les départements quand une région est sélectionnée
    const loadDepartments = async (regionId) => {
        if (!regionId) {
            setDepartments([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.getDepartments(regionId);
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des départements:', error);
        }
        setIsLoading(false);
    };

    // Charger les villes quand un département est sélectionné
    const loadCities = async (departmentId) => {
        if (!departmentId) {
            setCities([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.getCities(departmentId);
            setCities(response.data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des villes:', error);
        }
        setIsLoading(false);
    };

    return {
        regions,
        departments,
        cities,
        categories,
        isLoading,
        loadDepartments,
        loadCities
    };
};

