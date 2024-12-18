import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    Animated
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './styles';
import { ModalFormProps } from './types';
import { handleFileUpload, removeFile } from './fileHandlers';
import { useTheme } from '../hooks';
import { AuthContext } from '../context/AuthContext';
//var FormData = require('form-data');




const ModalForm: React.FC<ModalFormProps> = ({ visible, onClose, badge }) => {

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [commission, setCommission] = useState<number>(10);
    const { validFormMultiPart, usertoken } = useContext(AuthContext);

    const [fadeAnim] = useState(new Animated.Value(0));
    const [amount, setAmount] = useState('12 000€ HT');
    const [email, setEmail] = useState('jack.j@hilton.com');
    const [phone, setPhone] = useState('01 01 01 01 01');
    const [selectedCommission, setSelectedCommission] = useState(10);
    const [comment, setComment] = useState('');

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleSubmit = async () => {
        if (!amount.trim() || !email.trim() || !phone.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir les champs Montant, Mail et Tel');
            return;
        }

        if (selectedFiles.length === 0) {
            Alert.alert('Erreur', 'Veuillez sélectionner au moins un devis');
            return;
        }

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            let data = new FormData();
            data.append('token', usertoken);
            data.append('action', 'save-all-datas');
            data.append('amount', amount);
            data.append('email', email);
            data.append('phone', phone);
            data.append('commission', commission.toString());
            data.append('comment', comment);
            // Ajouter les fichiers un par un
            selectedFiles.forEach((file, index) => {
                data.append(`fichiers[${index}]`, {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/octet-stream',
                });
            });

            await validFormMultiPart(data);
            resetForm();
        } catch (error) {
            console.error('Erreur de soumission:', error);
            Alert.alert('Erreur', 'Impossible de soumettre le formulaire');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setAmount('');
        setEmail('');
        setPhone('');
        setSelectedFiles([]);
        setCommission(10);
        setComment('');
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <Animated.View style={[styles.modalView, { opacity: fadeAnim }]}>
                    <Text style={styles.modalTitle}>Inserer devis pour</Text>
                    <View style={styles.hotelNameContainer}>
                        <Text style={styles.hotelName}>{badge}</Text>
                    </View>
                    <View style={styles.formSection}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Montant du devis HT :</Text>
                            <TextInput
                                style={[styles.input, { width: '50%' }]}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mail du prestataire :</Text>
                            <TextInput
                                style={[styles.input, { width: '50%' }]}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tel du prestataire :</Text>
                            <TextInput
                                style={[styles.input, { width: '50%' }]}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                    </View>

                    <View style={[styles.formSection, { justifyContent: 'center', alignItems: 'center' }]}>

                        <TouchableOpacity
                            style={[styles.fileUploadButton, { backgroundColor: useTheme().colors.info }]}
                            onPress={() => handleFileUpload(selectedFiles).then(setSelectedFiles)}
                        >
                            <Ionicons
                                name="cloud-upload-outline"
                                size={24}
                                color="white"
                            />
                            <Text style={styles.fileUploadButtonText}>
                                Ajouter des devis
                            </Text>
                        </TouchableOpacity>

                        <ScrollView
                            style={styles.fileListContainer}
                            contentContainerStyle={styles.fileListContent}
                        >
                            {selectedFiles.map((file, index) => (
                                <View key={file.uri} style={styles.fileItem}>
                                    <Text style={styles.fileItemText}>
                                        Devis {index + 1}: {file.name}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setSelectedFiles(prevFiles => removeFile(prevFiles, file.uri))}
                                        style={styles.fileRemoveButton}
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={24}
                                            color="#dc3545"
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={[styles.formSection, { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }]}>
                        <Text style={styles.sectionTitle}>Commission :</Text>
                        <View style={styles.commissionButtons}>
                            {[10, 12, 15].map((rate) => (
                                <TouchableOpacity
                                    key={rate}
                                    style={[
                                        styles.commissionButton,
                                        commission === rate && { backgroundColor: useTheme().colors.warning }
                                    ]}
                                    onPress={() => setCommission(rate)}
                                >
                                    <Text style={[
                                        styles.commissionButtonText,
                                        commission === rate && { color: 'white' }
                                    ]}>
                                        {rate}%
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formSection}>

                        <TextInput
                            style={styles.commentInput}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="commentaire de commission"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonCancel]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonTextCancel}>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonSubmit, { backgroundColor: useTheme().colors.warning }]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <Text style={[styles.buttonTextSubmit]}>
                                {isSubmitting ? 'Envoi en cours...' : 'Soumettre'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default ModalForm;

