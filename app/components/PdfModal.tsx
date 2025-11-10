import React from 'react';
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const PdfModal = ({ visible, onClose, pdfUri }) => {
    if (!pdfUri) return null;

    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUri)}`;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <WebView
                        source={{ uri: googleDocsUrl }}
                        style={styles.webview}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: width * 0.9,
        height: height * 0.8,
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden'
    },
    webview: {
        flex: 1
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default PdfModal;