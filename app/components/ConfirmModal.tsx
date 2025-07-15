import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Button from './Button'
import { useTheme } from '../hooks'
type ConfirmationModalProps = {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  message?: string // message est optionnel
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onCancel,
  message,
}) => {
  const { assets, colors, gradients, sizes } = useTheme()

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            {message || 'Voulez-vous continuer ?'}
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              flex={1}
              gradient={gradients.primary}
              style={[styles.button, styles.buttonYes]}
              onPress={onConfirm}
            >
              <Text style={styles.textStyle}>Oui</Text>
            </Button>
            <Button
              flex={1}
              gradient={gradients.info}
              style={[styles.button, styles.buttonNo]}
              onPress={onCancel}
            >
              <Text style={styles.textStyle}>Non</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}

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
    padding: 0,

    minWidth: 100,
    marginHorizontal: 10,
    height: 30,
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
})

export default ConfirmationModal
