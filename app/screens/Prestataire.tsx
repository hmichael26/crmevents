import React, { useContext, useState } from 'react';
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

export const Prestataire = () => {
    const { loading, getPrestaBy, error } = useApi();

    const { userdata } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<[] | null>(null);

    const [selectForm, setSelectForm] = useState({
        region: '',
        department: '',
        city: '',
        providerType: '',
        postalCode: '',
        minRooms: '',
        maxRooms: '',
        nom: ''
    });

    const submit = async () => {
        setIsLoading(true);
        try {
            // Filtrer les champs non-nuls
            const filteredForm = Object.fromEntries(
                Object.entries(selectForm).filter(([_, value]) =>
                    value !== null && value !== undefined && value !== ''
                )
            );

            // Renommer les clés si nécessaire pour correspondre au format attendu
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

            const formattedData = Object.entries(filteredForm).reduce((acc, [key, value]) => {
                const newKey = mappedKeys[key] || key;
                acc[newKey] = value;
                return acc;
            }, {});

            console.log(formattedData);
            // Appel à l'API
            const response = await getPrestaBy(formattedData);
            //    console.log(response.data.all_prests);

            setSearchResults(Array.isArray(response.data.all_prests) ? response.data.all_prests : 0);

            // Mettre à jour les résultats avec la réponse de l'API
            //setSearchResults(response. || 0);

            // Vous pouvez aussi stocker les prestataires si nécessaire
            // setPrestataires(response);

        } catch (e) {
            console.log(error)

            console.error('Erreur lors de la recherche:', e);
            // Gérer l'erreur ici (par exemple, afficher un message à l'utilisateur)
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <Text style={styles.title}>PRESTATAIRES</Text>


                    <View style={styles.searchSection}>
                        <View style={{ flexDirection: 'row', gap: 5 }}>
                            <View style={[styles.pickerContainer, { width: '50%' }]}>
                                <Picker
                                    selectedValue={selectForm.region}
                                    onValueChange={(itemValue) => setSelectForm({ ...selectForm, region: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Sélectionner une région" value="" />
                                    {userdata.all_regions.map((item, index) => (
                                        <Picker.Item label={item.name} value={item.id} key={index} />
                                    ))}
                                </Picker>
                            </View>

                            <View style={[styles.pickerContainer, { width: '50%' }]}>
                                <Picker
                                    selectedValue={selectForm.department}
                                    onValueChange={(itemValue) => setSelectForm({ ...selectForm, department: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Sélectionner un département" value="" />
                                    {userdata.all_depts.map((item, index) => (
                                        <Picker.Item label={item.name} value={item.id} key={index} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 5 }}>
                            <View style={[styles.pickerContainer, { width: '50%' }]}>
                                <Picker
                                    selectedValue={selectForm.city}
                                    onValueChange={(itemValue) => setSelectForm({ ...selectForm, city: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Sélectionner une ville" value="" />
                                    {userdata.all_cities.map((item, index) => (
                                        <Picker.Item label={item.name} value={item.id} key={index} />
                                    ))}
                                </Picker>
                            </View>

                            <View style={[styles.pickerContainer, { width: '50%' }]}>
                                <Picker
                                    selectedValue={selectForm.providerType}
                                    onValueChange={(itemValue) => setSelectForm({ ...selectForm, providerType: itemValue })}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Type de prestataire" value="" />
                                    {userdata.all_categories.map((item, index) => (
                                        <Picker.Item label={item.libelle} value={item.id} key={index} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Rest of the form inputs remain the same */}
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.inputHalf]}
                                placeholder="Code Postal"
                                value={selectForm.postalCode}
                                onChangeText={(text) => setSelectForm({ ...selectForm, postalCode: text })}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, styles.inputHalf]}
                                placeholder="Nb de chambre min."
                                value={selectForm.minRooms}
                                onChangeText={(text) => setSelectForm({ ...selectForm, minRooms: text })}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, styles.inputHalf]}
                                placeholder="Nb de salle min."
                                value={selectForm.maxRooms}
                                onChangeText={(text) => setSelectForm({ ...selectForm, maxRooms: text })}
                                keyboardType="numeric"
                            />
                        </View>

                        <TextInput
                            style={[styles.input, { fontSize: 16 }]}
                            placeholder="Nom du prestataire"
                            value={selectForm.nom}
                            onChangeText={(text) => setSelectForm({ ...selectForm, nom: text })}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
                            <TouchableOpacity
                                style={[styles.searchButton, { paddingHorizontal: 25 }]}
                                onPress={submit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.searchButtonText}>Rechercher</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={[]}>
                                <Icon name="search" size={30} color="#9932CC" />
                            </TouchableOpacity>
                        </View>

                        {searchResults !== null && (
                            <Text style={styles.resultCount}>
                                Resultat de recherche : <Text style={{ color: '#9932CC', fontWeight: 'bold', fontSize: 20 }}>{searchResults.length}</Text> prestataires.
                            </Text>
                        )}

                        {/* Provider Card */}
                        {searchResults !== null && searchResults.length > 0 && searchResults.map((provider: any, index: any) => (
                            <ProviderCard provider={provider} onModify={() => console.log('Modifier')} onDelete={() => console.log('Supprimer')} />
                        ))}

                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

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
});

export default Prestataire;

