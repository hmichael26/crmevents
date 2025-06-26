import React, { useContext, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Animated,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { styles } from './styles'
import { ModalFormProps } from './types'
import { handleFileUpload, removeFile } from './fileHandlers'
import { useTheme } from '../hooks'
import { AuthContext } from '../context/AuthContext'
import Button from './Button'
//var FormData = require('form-data');

import { useToast } from '../components/ToastComponent'

const ModalForm: React.FC<ModalFormProps> = ({
  visible,
  onClose,
  badge,
  formParam,
  onSubmit,
}) => {
  const { showToast, ToastComponent } = useToast()
  console.log(formParam)
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [commission, setCommission] = useState<number>(10)
  const { validFormMultiPart, usertoken } = useContext(AuthContext)

  const [fadeAnim] = useState(new Animated.Value(0))
  const [amount, setAmount] = useState('12 000€ HT')
  const [email, setEmail] = useState('jack.j@hilton.com')
  const [phone, setPhone] = useState('01 01 01 01 01')
  const [selectedCommission, setSelectedCommission] = useState(10)
  const [comment, setComment] = useState('')
  const { assets, colors, gradients, sizes } = useTheme()

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un devis')
      return
    }

    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      let data = new FormData()
      data.append('token', usertoken)
      data.append('action', 'save-all-datas')

      data.append('id_deroule', formParam.id_deroule)
      data.append('id_presta', formParam.id_presta)
      // Ajouter les fichiers un par un
      selectedFiles.forEach((file, index) => {
        data.append(`fichiers[${index}]`, {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        })
      })

      await validFormMultiPart(data)
      showToast('✅ Données sauvegardées avec succès !', 'success')

      onSubmit()
      resetForm()
    } catch (error) {
      console.error('Erreur de soumission:', error)
      Alert.alert('Erreur', 'Impossible de soumettre le formulaire')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setEmail('')
    setPhone('')
    setSelectedFiles([])
    setCommission(10)
    setComment('')
    onClose()
  }

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

          <View
            style={[
              styles.formSection,
              { justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <Button
              style={[
                styles.fileUploadButton,
                { backgroundColor: useTheme().colors.info },
              ]}
              gradient={gradients.info}
              marginBottom={sizes.base / 2}
              // height={sizes.xl}

              rounded={true}
              round={false}
              onPress={() =>
                handleFileUpload(selectedFiles).then(setSelectedFiles)
              }
            >
              <Ionicons name="cloud-upload-outline" size={24} color="white" />
              <Text style={styles.fileUploadButtonText}>Ajouter des devis</Text>
            </Button>

            <ScrollView
              style={styles.fileListContainer}
              contentContainerStyle={[
                styles.fileListContent,
                { backgroundColor: 'transparent' },
              ]}
            >
              {selectedFiles.map((file, index) => (
                <View key={file.uri} style={styles.fileItem}>
                  <Text
                    style={[
                      styles.fileItemText,
                      { color: useTheme().colors.primary },
                    ]}
                  >
                    Devis {index + 1}: {file.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedFiles((prevFiles) =>
                        removeFile(prevFiles, file.uri),
                      )
                    }
                    style={styles.fileRemoveButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={useTheme().colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              flex={1}
              gradient={gradients.secondary}
              style={[
                styles.button,
                { backgroundColor: useTheme().colors.text },
              ]}
              onPress={onClose}
            >
              <Text style={styles.buttonTextCancel}>Annuler</Text>
            </Button>

            <Button
              flex={1}
              gradient={gradients.primary}
              style={[
                styles.button,
                styles.buttonSubmit,
                { backgroundColor: useTheme().colors.primary },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={[styles.buttonTextSubmit]}>
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre'}
              </Text>
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default ModalForm
