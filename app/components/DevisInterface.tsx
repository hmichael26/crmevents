import React, { useState, useEffect } from 'react'
import { Alert, View, StyleSheet, Dimensions, PixelRatio } from 'react-native'
import Button from './Button'
import { Picker } from '@react-native-picker/picker'
import Text from './Text'
import { useApi } from '../context/useApi'
import ConfirmationModal from './ConfirmModal'
import Dropdown from './Dropdown'

// ===========================
// CONSTANTES RESPONSIVES
// ===========================
const { width, height } = Dimensions.get('window')
const fontScale = PixelRatio.getFontScale()

// Fonctions responsives cohérentes avec Form4
const getFontSizeResponsive = (size) => {
  const scale = width / 375 // Base sur iPhone X
  const newSize = size * scale
  return Math.max(newSize / fontScale, size * 0.8) // Taille minimum
}

const getResponsiveWidth = (percentage) => width * (percentage / 150)
const getResponsiveHeight = (percentage) => height * (percentage / 150)

// Breakpoints responsifs
const isSmallScreen = width < 350
const isMediumScreen = width >= 350 && width < 400
const isLargeScreen = width >= 400

const DevisInterface = ({
  activeBadgeData,
  gradients,
  sizes,
  getFontSize,
  openDevis,
  colors, // Ajout du paramètre colors pour la cohérence
}) => {
  // ===========================
  // ÉTATS LOCAUX
  // ===========================
  const [devisSelections, setDevisSelections] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalVisible2, setModalVisible2] = useState(false)
  const [selectedDevisId, setSelectedDevisId] = useState(null)

  // ===========================
  // HOOKS & API
  // ===========================
  const { validdevis } = useApi()

  // Options cohérentes avec Form4 (UPPERCASE)
  const options = [
    { id: '1', label: 'OUI' },
    { id: '2', label: 'NON' },
    { id: '3', label: 'SUPPRIMER' },
  ]

  // ===========================
  // EFFETS
  // ===========================
  useEffect(() => {
    if (!activeBadgeData?.all_devis) return

    const initialSelections = {}
    activeBadgeData.all_devis.forEach((devis) => {
      initialSelections[devis.id_devis] =
        devis.valid === '1' ? 'OUI' : devis.valid === '2' ? 'NON' : ''
    })
    setDevisSelections(initialSelections)
  }, [activeBadgeData])

  // ===========================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ===========================
  const updateDevisStatus = async (devisId, status) => {
    setIsSubmitting(true)
    try {
      const apiStatus = status.toLowerCase() // API attend lowercase
      const response = await validdevis({ id_devis: devisId, valid: apiStatus })
      setDevisSelections((prev) => ({ ...prev, [devisId]: status }))
      Alert.alert('CONFIRMATION', 'VOTRE DEVIS A ÉTÉ MIS À JOUR AVEC SUCCÈS')
    } catch (error) {
      console.error('ERREUR LORS DE LA MISE À JOUR DU DEVIS:', error)
      Alert.alert(
        'ERREUR',
        'LA MISE À JOUR DU DEVIS A ÉCHOUÉ. VEUILLEZ RÉESSAYER.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOptionSelect = (devisId, itemValue) => {
    if (itemValue === 'SUPPRIMER') {
      setSelectedDevisId(devisId)
      setModalVisible2(true)
    } else {
      updateDevisStatus(devisId, itemValue)
    }
  }

  const confirmDeletion = () => {
    if (selectedDevisId) {
      updateDevisStatus(selectedDevisId, 'SUPPRIMER')
      setModalVisible2(false)
      setSelectedDevisId(null)
    }
  }

  const handleCancelDeletion = () => {
    setModalVisible2(false)
    setSelectedDevisId(null)
  }

  // ===========================
  // RENDU CONDITIONNEL
  // ===========================
  if (!activeBadgeData?.all_devis || activeBadgeData.all_devis.length === 0) {
    return null
  }

  // ===========================
  // RENDU PRINCIPAL
  // ===========================
  return (
    <>
      {activeBadgeData.all_devis.map((item, index) => (
        <View key={item.id_devis || index} style={styles.devisRow}>
          <Button
            flex={1}
            gradient={gradients.info}
            marginBottom={sizes.base / 2}
            rounded={false}
            round={false}
            onPress={() => openDevis(item.lien_devis)}
            disabled={isSubmitting}
          >
            <Text
              white
              size={getFontSize(isSmallScreen ? 11 : 13)}
              style={styles.buttonText}
            >
              OUVRIR
            </Text>
            <Text
              white
              size={getFontSize(isSmallScreen ? 10 : 12)}
              style={styles.buttonText}
            >
              DEVIS {index + 1}
            </Text>
          </Button>

          <View style={styles.dropdownContainer}>
            <Dropdown
              data={options}
              onChange={(value) =>
                handleOptionSelect(item.id_devis, value.label)
              }
              placeholder="VALIDER"
              defaultValue={{
                [item.id_devis]: devisSelections[item.id_devis],
              }}
            />
          </View>
        </View>
      ))}

      {/* Modal de confirmation pour la suppression */}
      <ConfirmationModal
        visible={modalVisible2}
        onClose={handleCancelDeletion}
        onConfirm={confirmDeletion}
        onCancel={handleCancelDeletion}
        message="VOULEZ-VOUS VRAIMENT SUPPRIMER CE DEVIS ?"
      />
    </>
  )
}

// ===========================
// STYLES RESPONSIFS
// ===========================
const styles = StyleSheet.create({
  devisRow: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveWidth(2),
    marginHorizontal: getResponsiveWidth(1),
    marginVertical: getResponsiveHeight(0.5),
  },
  buttonText: {
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  dropdownContainer: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc', // Idéalement, utiliser colors.border si disponible
    paddingHorizontal: getResponsiveWidth(0.5),
    borderRadius: 10,
    marginBottom: getResponsiveHeight(0.5),
    height: getFontSizeResponsive(isSmallScreen ? 40 : 48),
    marginTop: isSmallScreen ? getResponsiveHeight(1) : 0,
  },
})

export default DevisInterface
