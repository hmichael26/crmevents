import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useApi } from '../context/useApi';

const LOCATION_FIELDS = {
    department: {
        label: 'Département',
        searchBy: 'dept',
        dataKey: 'all_depts',
    },
    region: {
        label: 'Région',
        searchBy: 'region',
        dataKey: 'all_regions',
    },
    city: {
        label: 'Ville',
        searchBy: 'ville',
        dataKey: 'all_cities',
    }
};

// Contexte pour le cache des données de localisation
const LocationDataContext = createContext();

export const LocationDataProvider = ({ children }) => {
    const api = useApi();

    const [cache, setCache] = useState({
        department: new Map(),
        region: new Map(),
        city: new Map()
    });
    const [loading, setLoading] = useState({});

    const loadDataForField = useCallback(async (field) => {
        if (loading[field]) return;

        const config = LOCATION_FIELDS[field];
        setLoading(prev => ({ ...prev, [field]: true }));

        try {
            const response = await api.getprestaprms({
                searchby: config.searchBy
            });

            if (response?.data?.[config.dataKey]) {
                const newData = response.data[config.dataKey];
                setCache(prev => ({
                    ...prev,
                    [field]: new Map(newData.map(item => [item.id, item]))
                }));
            }
        } catch (err) {
            console.error(`Error loading ${field} data:`, err);
        } finally {
            setLoading(prev => ({ ...prev, [field]: false }));
        }
    }, [api]);

    const loadById = useCallback(async (field, id) => {
        if (!id || cache[field].has(id)) return;

        const config = LOCATION_FIELDS[field];
        try {
            const response = await api.getprestaprms({
                searchby: config.searchBy,
                id: id
            });

            if (response?.data?.[config.dataKey]?.[0]) {
                const newItem = response.data[config.dataKey][0];
                setCache(prev => ({
                    ...prev,
                    [field]: new Map(prev[field].set(newItem.id, newItem))
                }));
            }
        } catch (err) {
            console.error(`Error loading ${field} by id:`, err);
        }
    }, [cache]);

    const getItemById = useCallback((field, id) => {
        return cache[field].get(id) || null;
    }, [cache]);

    const getAllItems = useCallback((field) => {
        return Array.from(cache[field].values());
    }, [cache]);

    return (
        <LocationDataContext.Provider value={{
            loading,
            loadDataForField,
            loadById,
            getItemById,
            getAllItems
        }}>
            {children}
        </LocationDataContext.Provider>
    );
};

// Hook personnalisé pour utiliser le cache
export const useLocationCache = () => {
    const context = useContext(LocationDataContext);
    if (!context) {
        throw new Error('useLocationCache must be used within a LocationDataProvider');
    }
    return context;
};

// Composant de sélection optimisé
export const LocationPicker = React.memo(({
    field,
    value,
    onChange,
    disabled = false
}) => {
    const {
        loading,
        loadDataForField,
        getItemById,
        getAllItems
    } = useLocationCache();

    useEffect(() => {
        if (value) {
            loadDataForField(field);
        }
    }, [field, value]);

    const config = LOCATION_FIELDS[field];
    const items = getAllItems(field);

    return (
        <View style={styles.pickerContainer}>
            <Picker
                enabled={!disabled && !loading[field]}
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                onFocus={() => loadDataForField(field)}
            >
                <Picker.Item
                    label={loading[field] ? "Chargement..." : config.label}
                    value=""
                />
                {items.map((item) => (
                    <Picker.Item
                        key={item.id}
                        label={item.name}
                        value={item.id}
                    />
                ))}
            </Picker>
            {loading[field] && (
                <ActivityIndicator
                    style={styles.loading}
                    color="#9932CC"
                    size="small"
                />
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        height: 40,
        justifyContent: 'center',
        marginVertical: 8,
    },
    picker: {
        width: '100%',
    },
    loading: {
        position: 'absolute',
        right: 8,
    }
});