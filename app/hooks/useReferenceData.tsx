import { useState, useEffect } from 'react';
import { useApi } from '../context/useApi';

// Hook personnalisé pour gérer le chargement des données de référence
export const useReferenceData = (initialProvider) => {
    const { getprestaprms } = useApi();
    const [referenceData, setReferenceData] = useState({
        regions: [],
        departments: [],
        cities: [],
        loadingStates: {
            regions: false,
            departments: false,
            cities: false
        },
        error: null
    });

    const loadAllReferenceData = async () => {
        setReferenceData(prev => ({
            ...prev,
            loadingStates: {
                regions: true,
                departments: true,
                cities: true
            }
        }));

        try {
            // Charger toutes les données en parallèle
            const [regionsResponse, departementsResponse, citiesResponse] = await Promise.all([
                getprestaprms({ searchby: 'region' }),
                getprestaprms({ searchby: 'dept' }),
                getprestaprms({ searchby: 'ville' })
            ]);

            setReferenceData({
                regions: regionsResponse.data.all_regions || [],
                departments: departementsResponse.data.all_depts || [],
                cities: citiesResponse.data.all_cities || [],
                loadingStates: {
                    regions: false,
                    departments: false,
                    cities: false
                },
                error: null
            });
        } catch (error) {
            console.error('Error loading reference data:', error);
            setReferenceData(prev => ({
                ...prev,
                loadingStates: {
                    regions: false,
                    departments: false,
                    cities: false
                },
                error: 'Failed to load reference data'
            }));
        }
    };

    // Charger les données au montage du composant
    useEffect(() => {
        loadAllReferenceData();
    }, []); // Dépendance vide pour ne charger qu'au montage

    return {
        ...referenceData,
        reload: loadAllReferenceData
    };
};