import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const PdfReader = () => {
    const [pdfBase64, setPdfBase64] = useState(null);

    useEffect(() => {
        const fetchPdfAsBlob = async () => {
            try {
                const response = await fetch('https://www.goseminaire.com/crm/upload/PAVILLON-GAUD_Plaquette1607527352.pdf');
                const blob = await response.blob();

                // Convert Blob to Base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPdfBase64(reader.result);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error fetching PDF:', error);
            }
        };

        fetchPdfAsBlob();
    }, []);

    if (!pdfBase64) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <WebView
            originWhitelist={['*']}
            source={{ uri: pdfBase64 }}
            style={styles.webview}
        />
    );
};

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    webview: {
        flex: 1,
    },
});

export default PdfReader;
