

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useApi } from '../context/useApi';
import { useTheme } from '../hooks';

export const ProviderCard = ({ provider, onModify, onDelete }) => {

    const { deletepresta } = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProvider, setEditedProvider] = useState(provider);

    const handleModify = async () => {
        if (isEditing) {
            setIsLoading(true); // Démarrer le chargement
            try {
                const data = { ...editedProvider, id_presta: provider.id };
                await onModify(data); // Assurez-vous que `onModify` est une fonction asynchrone
            } catch (error) {
                console.error("Erreur lors de la modification :", error);
            } finally {
                setIsLoading(false); // Terminer le chargement
            }
        }
        setIsEditing(!isEditing);
    };

    const handleDelete = async () => {
        if (!provider.id) return;

        Alert.alert(
            "Supprimer prestataire",
            "Êtes-vous sûr de vouloir supprimer ce prestataire ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    onPress: async () => {
                        setIsLoading(true); // Démarrer le chargement
                        try {
                            await onDelete({ id_presta: provider.id }); // Assurez-vous que `onDelete` est une fonction asynchrone
                        } catch (error) {
                            console.error("Erreur lors de la suppression :", error);
                        } finally {
                            setIsLoading(false); // Terminer le chargement
                        }
                    },
                    style: "destructive"
                },
            ],
            { cancelable: false }
        );
    };



    const handleInputChange = (field, value) => {
        setEditedProvider(prev => ({ ...prev, [field]: value }));
    };



    const renderEditableField = (field, placeholder) => (
        <TextInput
            style={styles.input}
            value={editedProvider[field]}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholder={placeholder}
        />
    );

    return (
        <View style={styles.providerCard}>
            {isEditing ? (
                <>
                    {renderEditableField('nom', 'Nom')}
                    {renderEditableField('tel', 'Téléphone')}
                    {renderEditableField('email1', 'Email')}
                    {renderEditableField('nb_salle', 'Nombre de salles')}
                    {renderEditableField('nb_chbre', 'Nombre de chambres')}
                    {renderEditableField('fk_departement', 'Département')}
                    {renderEditableField('ville', 'Ville')}
                    {renderEditableField('fk_region', 'Région')}
                </>
            ) : (
                <>
                    <Text style={styles.providerName}>{provider.nom}</Text>

                    <View style={styles.tagContainer}>
                        {provider.tel && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{provider.tel}</Text>
                            </View>
                        )}
                        {provider.email1 && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{provider.email1}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.tagContainer}>
                        {provider.nb_salle && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{provider.nb_salle} salles</Text>
                            </View>
                        )}
                        {provider.nb_chbre && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{provider.nb_chbre} ch.</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.tagContainer}>
                        {provider.fk_departement && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{provider.fk_departement}</Text>
                            </View>
                        )}
                        {provider.ville && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{provider.ville}</Text>
                            </View>
                        )}
                        {provider.fk_region && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{provider.fk_region}</Text>
                            </View>
                        )}
                    </View>
                </>
            )}

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.modifyButton, { backgroundColor: useTheme().colors.primary }]}
                    onPress={handleModify}
                    disabled={isLoading} // Désactiver le bouton pendant le chargement
                >
                    <Text style={styles.modifyButtonText}>
                        {isLoading && isEditing ? 'En cours...' : isEditing ? 'Enregistrer' : 'Modifier'}
                    </Text>
                </TouchableOpacity>

                {!isEditing && (
                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: useTheme().colors.danger }]}
                        onPress={handleDelete}
                        disabled={isLoading} // Désactiver le bouton pendant le chargement
                    >
                        <Text style={styles.deleteButtonText}>
                            {isLoading ? 'Suppression...' : 'Supprimer'}
                        </Text>
                    </TouchableOpacity>
                )}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    providerCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        marginVertical: 8,
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
        flexWrap: 'nowrap',
        gap: 8,
        justifyContent: 'space-between',
    },
    tag: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        flex: 1,
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
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 8,
    },
});

