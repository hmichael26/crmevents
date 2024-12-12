import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';

export const Prestataire = () => {
    const [region, setRegion] = useState('');
    const [department, setDepartment] = useState('');
    const [city, setCity] = useState('');
    const [providerType, setProviderType] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [minRooms, setMinRooms] = useState('');
    const [maxRooms, setMaxRooms] = useState('');
    const [providerName, setProviderName] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <Text style={styles.title}>PRESTATAIRES</Text>


                    <View style={styles.searchSection}>
                        <View style={{ flexDirection: 'row', gap: 5 }}>
                            <View style={[styles.pickerContainer, { width: '50%' }]}>
                                <Picker
                                    selectedValue={region}
                                    onValueChange={setRegion}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Région" value="" />
                                    <Picker.Item label="Loire atlantique" value="loire" />
                                </Picker>
                            </View>

                            <View style={[styles.pickerContainer, { width: '50%' }]}>
                                <Picker
                                    selectedValue={department}
                                    onValueChange={setDepartment}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Département" value="" />
                                    <Picker.Item label="Loire-Atlantique" value="44" />
                                </Picker>
                            </View>

                        </View>

                        <View style={{ flexDirection: 'row', gap: 5 }}>

                            <View style={[styles.pickerContainer, { width: '50%' }]}>
                                <Picker
                                    selectedValue={city}
                                    onValueChange={setCity}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Ville" value="" />
                                    <Picker.Item label="Nantes" value="nantes" />
                                </Picker>
                            </View>

                            <View style={[styles.pickerContainer, { width: '50%' }]}>
                                <Picker
                                    selectedValue={providerType}
                                    onValueChange={setProviderType}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Type de prestataire" value="" />
                                    <Picker.Item label="Hôtel" value="hotel" />
                                </Picker>
                            </View>


                        </View>

                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.inputHalf]}
                                placeholder="Code Postal"
                                value={postalCode}
                                onChangeText={setPostalCode}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, styles.inputHalf]}
                                placeholder="Nb de chambre min."
                                value={minRooms}
                                onChangeText={setMinRooms}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, styles.inputHalf]}
                                placeholder="Nb de salle min."
                                value={maxRooms}
                                onChangeText={setMaxRooms}
                                keyboardType="numeric"
                            />
                        </View>

                        <TextInput
                            style={[styles.input, { fontSize: 16 }]}
                            placeholder="Nom du prestataire"
                            value={providerName}
                            onChangeText={setProviderName}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
                            <TouchableOpacity style={[styles.searchButton, { paddingHorizontal: 25 }]}>
                                <Text style={styles.searchButtonText}>Rechercher</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[]}>
                                <Icon name="search" size={30} color="#9932CC" />
                            </TouchableOpacity>
                        </View>


                        <Text style={styles.resultCount}>Resultat de recherche : <Text style={{ color: '#9932CC', fontWeight: 'bold', fontSize: 25 }}>5528</Text> prestataires.</Text>

                        {/* Provider Card */}
                        <View style={styles.providerCard}>
                            <Text style={styles.providerName}>HÔTEL CRILLON</Text>

                            <View style={styles.tagContainer}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>06 06 06 06 06</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>contact@hotelcrillon</Text>
                                </View>
                            </View>

                            <View style={styles.tagContainer}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>2 salles</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>128 ch.</Text>
                                </View>
                            </View>

                            <View style={styles.tagContainer}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>Loire atlantique</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>Nantes</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>Pays de la Loire</Text>
                                </View>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.modifyButton}>
                                    <Text style={styles.modifyButtonText}>Modifier</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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

