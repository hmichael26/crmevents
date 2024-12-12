import * as DocumentPicker from 'expo-document-picker';

export interface FormData {
    nom: string;
    prenom: string;
    commission: number;
    comment: string;
    fichiers: DocumentPicker.DocumentPickerResult[];
}

export interface ModalFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
}

