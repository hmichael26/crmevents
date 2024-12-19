// Installer les dépendances :
// expo install expo-document-picker expo-file-system react-native-webview

import React, { useState } from 'react';
import { StyleSheet, View, Button, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const PdfViewer = ({ url }) => {
    const [pdfUri, setPdfUri] = useState(url || null);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true
            });

            if (result.assets && result.assets[0]) {
                const asset = result.assets[0];
                setPdfUri(asset.uri);
            }
        } catch (error) {
            console.error('Erreur lors de la sélection du PDF:', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        webview: {
            flex: 1,
        },
        button: {
            margin: 10,
        }
    });

    const renderPdf = () => {
        if (!pdfUri) return null;

        // Sur le web, on peut afficher directement le PDF
        if (Platform.OS === 'web') {
            return (
                <iframe
                    src={pdfUri}
                    style={{ width: '100%', height: '100%' }}
                />
            );
        }

        // Sur mobile, on utilise Google PDF Viewer
        const googlePdfReader = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUri)}&embedded=true`;

        return (
            <WebView
                style={styles.webview}
                source={{ uri: googlePdfReader }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Button
                title="Sélectionner un PDF"
                onPress={pickDocument}
                style={styles.button}
            />
            {renderPdf()}
        </View>
    );
};

// Fonction utilitaire pour télécharger un PDF
const downloadPdf = async (url, filename) => {
    try {
        const downloadPath = `${FileSystem.cacheDirectory}${filename}.pdf`;

        const { uri } = await FileSystem.downloadAsync(
            url,
            downloadPath
        );

        console.log('PDF téléchargé:', uri);
        return uri;
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        throw error;
    }
};

export { PdfViewer, downloadPdf };