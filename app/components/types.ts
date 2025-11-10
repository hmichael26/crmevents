import * as DocumentPicker from 'expo-document-picker';

export interface FormData {
    amount: string;
    email: string;
    phone: any;
    commission: number;
    comment: string;
    fichiers: any;
}

export interface ModalFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formParam: any;
}

