import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Types for form data and component props
interface FormData {
    nom: string;
    prenom: string;
    fichier?: DocumentPicker.DocumentPickerResult;
}

interface ModalFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
}

const ModalForm: React.FC<ModalFormProps> = ({ visible, onClose, onSubmit }) => {
    const [nom, setNom] = useState<string>('');
    const [prenom, setPrenom] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<any>(null);

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all file types
                copyToCacheDirectory: true,
            });
            console.log(result)

            if (result.canceled === false) {
                setSelectedFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Erreur de sélection de fichier:', err);
        }
    };

    const handleSubmit = () => {
        console.log(
            nom.trim() && prenom.trim() && selectedFile
        )
        // Validate form before submission
        if (nom.trim() && prenom.trim()) {
            onSubmit({
                nom,
                prenom,
                fichier: selectedFile
            });
            // Reset form
            setNom('');
            setPrenom('');
            setSelectedFile(null);
            onClose();
        } else {
            alert('Veuillez remplir tous les champs obligatoires');
        }
    };

    const getFileUploadButtonStyle = () => {
        return selectedFile 
            ? [styles.fileUploadButton, styles.fileUploadButtonSuccess] 
            : styles.fileUploadButton;
    };

    const getFileUploadButtonTextStyle = () => {
        return selectedFile 
            ? [styles.fileUploadButtonText, styles.fileUploadButtonTextSuccess] 
            : styles.fileUploadButtonText;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Formulaire</Text>

                    {/* Champ Nom */}
                    <TextInput
                        style={styles.input}
                        placeholder="Nom"
                        value={nom}
                        onChangeText={setNom}
                    />

                    {/* Champ Prénom */}
                    <TextInput
                        style={styles.input}
                        placeholder="Prénom"
                        value={prenom}
                        onChangeText={setPrenom}
                    />

                    {/* Bouton Upload Fichier */}
                    <TouchableOpacity
                        style={getFileUploadButtonStyle()}
                        onPress={handleFileUpload}
                    >
                        <Ionicons
                            name={selectedFile ? "checkmark-circle" : "cloud-upload-outline"}
                            size={24}
                            color="white"
                        />
                        <Text style={getFileUploadButtonTextStyle()}>
                            {selectedFile
                                ? `Fichier uploadé: ${selectedFile.name}`
                                : 'Dévis à uploader'}
                        </Text>
                    </TouchableOpacity>

                    {/* Boutons d'action */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonCancel]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonTextCancel}>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonSubmit]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonTextSubmit}>Soumettre</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 15,
        borderRadius: 10
    },
    fileUploadButton: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        width: '100%'
    },
    fileUploadButtonSuccess: {
        backgroundColor: '#28a745'
    },
    fileUploadButtonText: {
        color: 'white',
        marginLeft: 10
    },
    fileUploadButtonTextSuccess: {
        color: 'white',
        marginLeft: 10,
        textDecorationLine: 'underline'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    button: {
        padding: 10,
        borderRadius: 10,
        width: '48%',
        alignItems: 'center'
    },
    buttonCancel: {
        backgroundColor: '#6c757d'
    },
    buttonSubmit: {
        backgroundColor: '#28a745'
    },
    buttonTextCancel: {
        color: 'white',
        fontWeight: 'bold'
    },
    buttonTextSubmit: {
        color: 'white',
        fontWeight: 'bold'
    }
});

export default ModalForm;