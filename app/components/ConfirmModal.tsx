import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
type ConfirmationModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onCancel: () => void;
    message?: string;  // message est optionnel
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    onClose,
    onConfirm,
    onCancel,
    message,
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>{message || "Voulez-vous continuer ?"}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.buttonYes]} onPress={onConfirm}>
                            <Text style={styles.textStyle}>Oui</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonNo]} onPress={onCancel}>
                            <Text style={styles.textStyle}>Non</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        marginTop: 22,
        
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        minWidth: 100,
        marginHorizontal: 10,
    },
    buttonYes: {
        backgroundColor: '#28a745',
    },
    buttonNo: {
        backgroundColor: '#dc3545',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ConfirmationModal;
