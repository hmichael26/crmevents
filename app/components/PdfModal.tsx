import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import Text from './Text'; // Composant personnalisé pour le texte

const PdfModal = ({ visible, onClose, pdfUri }) => {
    const [localPdf, setLocalPdf] = useState(null);


    useEffect(() => {
        const loadPdf = async () => {
            if (pdfUri && visible) {
                const localUri = `${FileSystem.documentDirectory}temp.pdf`;
                await FileSystem.downloadAsync(pdfUri, localUri);
                setLocalPdf(localUri);
            }
        };
        loadPdf();
    }, [pdfUri, visible]);

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {localPdf ? (
                    <WebView
                        source={{ uri: localPdf }}
                        style={styles.webview}
                        startInLoadingState={true}
                    />
                ) : (
                    <Text>Chargement...</Text>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text white bold>Fermer</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    webview: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 5,
    },
});

export default PdfModal;
