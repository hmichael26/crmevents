import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

export const handleFileUpload = async (selectedFiles: DocumentPicker.DocumentPickerAsset[]) => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
            allowMultipleSelection: true
        });

        if (!result.canceled) {
            const newFiles = result.assets.filter(
                newFile => !selectedFiles.some(
                    existingFile => existingFile.uri === newFile.uri
                )
            );

            return [...selectedFiles, ...newFiles];
        }
        return selectedFiles;
    } catch (err) {
        console.error('Erreur de sélection de fichier:', err);
        Alert.alert('Erreur', 'Impossible de sélectionner les fichiers');
        return selectedFiles;
    }
};

export const removeFile = (selectedFiles: DocumentPicker.DocumentPickerAsset[], uriToRemove: string) => {
    return selectedFiles.filter(file => file.uri !== uriToRemove);
};

