import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import { useApi } from '../context/useApi';
import { ProviderCard } from '../components/ProviderCard';

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
const PAGE_SIZE = 30;

export const Prestataire = () => {
    const { loading, getPrestaBy, error } = useApi();
    const { userdata } = useContext(AuthContext);


    const scrollViewRef = useRef(null);


    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<{
        all_prests: any[];
        nb_tot_presta: number;
    } | null>(null);
    const [selectForm, setSelectForm] = useState(initialFormState);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const handleInputChange = useCallback((name: string, value: string) => {
        setSelectForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const submit = useCallback(async () => {
        setIsLoading(true);
        setCurrentPage(1);
        setHasMore(true);
        try {
            await fetchData(1);
        } finally {
            setIsLoading(false);
        }
    }, [selectForm]);

    const fetchData = async (page: number, isNewSearch = false) => {
        try {
            const filteredForm = Object.fromEntries(
                Object.entries(selectForm).filter(([_, value]) => value !== '')
            );

            const mappedKeys = {
                providerType: 'fk_type',
                postalCode: 'cp',
                minRooms: 'nb_chbre',
                maxRooms: 'nb_salle',
                nom: 'nom',
                city: 'fk_ville',
                department: 'fk_departement',
                region: 'fk_region'
            };

            const formattedData = {
                ...Object.entries(filteredForm).reduce((acc, [key, value]) => {
                    const newKey = mappedKeys[key as keyof typeof mappedKeys] || key;
                    acc[newKey] = value;
                    return acc;
                }, {} as Record<string, string>),
                "current_page": page
            };

            const response = await getPrestaBy(formattedData);
            console.log(response.all_prests)

            if (!response.data) {
                setHasMore(false);
                return;
            }

            const newData = response.data;

            if (isNewSearch) {
                setSearchResults(newData);
            } else {
                setSearchResults(prev => ({
                    nb_tot_presta: newData.nb_tot_presta,
                    all_prests: [...newData.all_prests]
                }));
            }

            // Vérifier s'il y a plus de données à charger
            const totalPagesReceived = Math.ceil(newData.nb_tot_presta / PAGE_SIZE);
            setHasMore(page < totalPagesReceived);

        } catch (e) {
            console.error('Erreur lors de la recherche:', e);
            setHasMore(false);
        }
    };

    const handleScroll = useCallback(async (event: any) => {
        if (isLoadingMore || !hasMore) return;

        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;

        if (isCloseToBottom) {
            setIsLoadingMore(true);
            const nextPage = currentPage + 1;
            await fetchData(nextPage);
            setCurrentPage(nextPage);
            setIsLoadingMore(false);
        }
    }, [currentPage, hasMore, isLoadingMore]);

    const renderPickerItem = useCallback((item: any, index: number) => (
        <Picker.Item label={item.name || item.libelle} value={item.id} key={index} />
    ), []);

    const memoizedPickers = useMemo(() => ({
        region: userdata.all_regions.map(renderPickerItem),
        department: userdata.all_depts.map(renderPickerItem),
        city: userdata.all_cities.map(renderPickerItem),
        providerType: userdata.all_categories.map(renderPickerItem)
    }), [userdata, renderPickerItem]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}
                ref={scrollViewRef}
                onScroll={handleScroll}
                scrollEventThrottle={400} >
                <View style={styles.content}>
                    <Text style={styles.title}>PRESTATAIRES</Text>

                    <View style={styles.searchSection}>
                        <View style={styles.row}>
                            <PickerWrapper
                                selectedValue={selectForm.region}
                                onValueChange={(value) => handleInputChange('region', value)}
                                items={memoizedPickers.region}
                                placeholder="Sélectionner une région"
                            />
                            <PickerWrapper
                                selectedValue={selectForm.department}
                                onValueChange={(value) => handleInputChange('department', value)}
                                items={memoizedPickers.department}
                                placeholder="Sélectionner un département"
                            />
                        </View>

                        <View style={styles.row}>
                            <PickerWrapper
                                selectedValue={selectForm.city}
                                onValueChange={(value) => handleInputChange('city', value)}
                                items={memoizedPickers.city}
                                placeholder="Sélectionner une ville"
                            />
                            <PickerWrapper
                                selectedValue={selectForm.providerType}
                                onValueChange={(value) => handleInputChange('providerType', value)}
                                items={memoizedPickers.providerType}
                                placeholder="Type de prestataire"
                            />
                        </View>

                        <View style={styles.row}>
                            <CustomTextInput
                                placeholder="Code Postal"
                                value={selectForm.postalCode}
                                onChangeText={(text) => handleInputChange('postalCode', text)}
                                keyboardType="numeric"
                            />
                            <CustomTextInput
                                placeholder="Nb de chambre min."
                                value={selectForm.minRooms}
                                onChangeText={(text) => handleInputChange('minRooms', text)}
                                keyboardType="numeric"
                            />
                            <CustomTextInput
                                placeholder="Nb de salle min."
                                value={selectForm.maxRooms}
                                onChangeText={(text) => handleInputChange('maxRooms', text)}
                                keyboardType="numeric"
                            />
                        </View>

                        <CustomTextInput
                            placeholder="Nom du prestataire"
                            value={selectForm.nom}
                            onChangeText={(text) => handleInputChange('nom', text)}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.searchButton}
                                onPressIn={submit}
                                onPressOut={submit}
                                onPress={submit}

                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.searchButtonText}>Rechercher</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Icon name="search" size={30} color="#9932CC" />
                            </TouchableOpacity>
                        </View>

                        {searchResults !== null && (
                            <Text style={styles.resultCount}>
                                Resultat de recherche : <Text style={styles.resultCountHighlight}>{searchResults.nb_tot_presta}</Text> prestataires.
                            </Text>
                        )}

                        {searchResults !== null && searchResults?.all_prests.length > 0 && (
                            <>
                                {searchResults.all_prests.map((provider: any, index: number) => (
                                    <ProviderCard
                                        key={`${provider.id}-${index}`}
                                        provider={provider}
                                        onModify={() => console.log('Modifier')}
                                        onDelete={() => console.log('Supprimer')}
                                    />
                                ))}
                                {isLoadingMore && (
                                    <View style={styles.loadingMore}>
                                        <ActivityIndicator color="#9932CC" />
                                        <Text>Chargement...</Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
};

const PickerWrapper = React.memo(({ selectedValue, onValueChange, items, placeholder }: any) => (
    <View style={[styles.pickerContainer, { width: '50%' }]}>
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
        >
            <Picker.Item label={placeholder} value="" />
            {items}
        </Picker>
    </View>
));

const CustomTextInput = React.memo(({ ...props }: any) => (
    <TextInput
        style={[styles.input, styles.inputHalf]}
        {...props}
    />
));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#9932CC',
        marginBottom: 10,
        textAlign: 'center',
    },
    searchSection: {
        gap: 8,
    },
    loadingMore: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8
    },
    pickerContainer: {
        borderWidth: 1,
        padding: 5,
        borderColor: '#ddd',
        borderRadius: 15,
        flex: 1,

        justifyContent: 'center',
        height: 30,
        //  overflow: 'hidden',
    },
    picker: {


        width: '100%',
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        padding: 4,
        fontSize: 11,
        fontWeight: 'bold',

    },
    inputHalf: {
        flex: 1,
    },
    searchButton: {
        backgroundColor: '#9932CC',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
    },
    searchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultCount: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 10,
    },
    providerCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    providerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#B8B8D1',
        padding: 8,
        borderRadius: 8,
        textAlign: 'center',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    tagText: {
        color: '#666',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    modifyButton: {
        backgroundColor: '#FFA500',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flex: 1,
    },
    modifyButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flex: 1,
    },
    deleteButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        alignItems: 'center',
    },
    resultCountHighlight: {
        color: '#9932CC',
        fontWeight: 'bold',
        fontSize: 20,
    },

});

export default React.memo(Prestataire);

