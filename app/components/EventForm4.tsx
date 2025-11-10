import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
  PixelRatio,
  SafeAreaView,
  Text as TextBlock,
  Modal,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native'
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon'
import MultiSelect from './MultiSelectBox'
import { useTheme } from '../hooks'
import Switch from './Switch'
import Button from './Button'
import Badge from './Badge'
import Text from './Text'
import Icon from 'react-native-vector-icons/Ionicons'
import Fontisto from 'react-native-vector-icons/Fontisto'
import Font6 from 'react-native-vector-icons/FontAwesome6'
import Input from './Input'
import ConfirmationModal from './ConfirmModal'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Picker } from '@react-native-picker/picker'
import ModalForm from './ModalForm'
import { AuthContext } from '../context/AuthContext'
import PdfModal from './PdfModal'
import { useApi } from '../context/useApi'
import DevisInterface from './DevisInterface'
import Dropdown from './Dropdown'
import { useToast } from './ToastComponent'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

// ===========================
// CONSTANTES RESPONSIVES
// ===========================
const options = [
  { id: '1', label: 'OUI' },
  { id: '2', label: 'NON' },
  { id: '3', label: 'SUPPRIMER' },
]

const { width, height } = Dimensions.get('window')
const fontScale = PixelRatio.getFontScale()

// Fonctions responsives améliorées
const getFontSize = (size) => {
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

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const Form4 = ({ item, onDataChange, getData0, onRefresh, idevt }) => {
  const { showToast, ToastComponent } = useToast()
  // ===========================
  // HOOKS & API
  // ===========================
  const {
    validdevis,
    validbrochure,
    sendDemande,
    deletePresta,
    sendDemandes,
  } = useApi()
  const { assets, colors, gradients, sizes } = useTheme()

  // ===========================
  // ÉTATS LOCAUX
  // ===========================
  // États des données
  const [prestataireModifications, setPrestataireModifications] = useState({})
  const [formFields, setFormFields] = useState({
    comment: '',
    email: '',
    tel: '',
    budget: '',
  })

  const [badges, setBadges] = useState([])
  const [activeBadge, setActiveBadge] = useState(0)
  const [activeBadgeData, setActiveBadgeData] = useState(null)
  const [badgeToDelete, setBadgeToDelete] = useState(null)

  // États des modales
  const [pdfModalVisible, setPdfModalVisible] = useState(false)
  const [pdfUri, setPdfUri] = useState(null)
  const [modalFormDevis, setModalFormDevis] = useState(false)
  const [modalimage, setModalimage] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalVisible2, setModalVisible2] = useState(false)

  // États de l'interface
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedOption2, setSelectedOption2] = useState('')
  const [currentForm, setCurrentForm] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // États des switches (non utilisés dans le code actuel)
  const [switch1, setSwitch1] = useState(true)
  const [switch2, setSwitch2] = useState(true)
  const [switch3, setSwitch3] = useState(false)
  const [validForm1, setValid1] = useState(false)
  const [validForm2, setValid2] = useState(false)

  // ===========================
  // EFFETS
  // ===========================
  // Initialisation des badges
  useEffect(() => {
    if (item) {
      const badges = item?.all_presta_interroges?.map((item) => ({
        text: item.nom_presta?.toUpperCase() || '',
        number: 0,
        color: item.color,
      }))
      setBadges(badges)
    }
  }, [item])

  const transformSimple = (prestataireModifications) => {
    return Object.entries(prestataireModifications)
      .filter(
        ([nomPresta, modifications]) =>
          // Filtrer ceux qui ont un id_presta ET au moins un champ rempli
          modifications.id_presta &&
          (modifications.comment ||
            modifications.email ||
            modifications.tel ||
            modifications.contact ||
            modifications.budget),
      )
      .map(([nomPresta, modifications]) => ({
        id_presta: modifications.id_presta.toString(),
        comm_prestataire: modifications.comment || '',
        tel_presta: modifications.tel || modifications.contact || '',
        email_presta: modifications.email || '',
        budget: modifications.budget || '',
      }))
  }

  // Mise à jour des champs quand on change de prestataire actif
  useEffect(() => {
    if (activeBadgeData) {
      const savedModifications =
        prestataireModifications[activeBadgeData.nom_presta]
      setFormFields({
        comment: savedModifications?.comment || activeBadgeData.comment || '',
        email: savedModifications?.email || activeBadgeData.email || '',
        tel: savedModifications?.tel || activeBadgeData.contact || '',
        budget: savedModifications?.budget || activeBadgeData.budget || '',
      })
    }
  }, [activeBadgeData])

  // Notification des changements
  useEffect(() => {
    if (prestataireModifications) {
      const data = transformSimple(prestataireModifications)
      //  console.log({ prestaFields: data })
      onDataChange({ prestaFields: data })
      //    console.log(prestataireModifications)
    }
  }, [prestataireModifications])

  // ===========================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ===========================
  const handleFieldChange = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Mise à jour immédiate de prestataireModifications ET onDataChange
    if (activeBadgeData) {
      const updatedData = {
        ...formFields,
        [field]: value, // Nouvelle valeur
      }

      // Mettre à jour le state local
      setPrestataireModifications((prev) => {
        const newModifications = {
          ...prev,
          [activeBadgeData.nom_presta]: {
            id_presta: activeBadgeData.id_presta,
            ...updatedData,
          },
        }

        // Appeler onDataChange avec les nouvelles données
        onDataChange(newModifications)

        return newModifications
      })
    }
  }
  const handleOptionSelect = async (option, type) => {
    if (type === 1) {
      if (option === 'SUPPRIMER') {
        validateForm(1)
      } else {
        setSelectedOption(option)
      }
    } else {
      if (option === 'SUPPRIMER') {
        validateForm(2)
      } else {
        await validbrochure({
          id_presta: activeBadgeData.id_presta,
          valid: option.toLowerCase(),
        })
        setSelectedOption2(option)
      }
    }
  }

  const handleBadgeClick = (badgeIndex, value) => {
    if (activeBadgeData) {
      saveCurrentChanges()
    }

    setActiveBadge((prevActiveBadge) =>
      prevActiveBadge === badgeIndex ? 0 : badgeIndex,
    )

    const selectedPresta = item.all_presta_interroges.find(
      (presta) => presta.nom_presta?.toUpperCase() === value.text,
    )
    setActiveBadgeData(selectedPresta)
  }

  const handleBadgeDataWithPrestaName = (value) => {
    const selectedPresta = item.all_presta_interroges.find(
      (presta) => presta.nom_presta?.toUpperCase() === value.toUpperCase(),
    )
    setActiveBadgeData(selectedPresta)
  }

  const handleBadgeDelete = (index) => {
    setBadgeToDelete(index)
    setModalVisible2(true)
  }

  const handleConfirm = async () => {
    if (currentForm === 1) {
      setSelectedOption('SUPPRIMER')
    } else if (currentForm === 2) {
      //    console.log(activeBadgeData, activeBadgeData?.id_presta)
      await validbrochure({
        id_presta: activeBadgeData?.id_presta,
        valid: 'supprimer',
      })
      setSelectedOption2('SUPPRIMER')
    }
    setModalVisible(false)
    setCurrentForm(null)
  }

  const handleCancel = () => {
    setModalVisible(false)
    setCurrentForm(null)
  }

  // ===========================
  // FONCTIONS UTILITAIRES
  // ===========================
  const validateForm = (formNumber) => {
    setCurrentForm(formNumber)
    setModalVisible(true)
  }

  const saveCurrentChanges = () => {
    if (activeBadgeData) {
      const hasChanges = Object.values(formFields).some((value) => value !== '')

      if (hasChanges) {
        setPrestataireModifications((prev) => ({
          ...prev,
          [activeBadgeData.nom_presta]: {
            ...formFields,
          },
        }))
      }
    }
  }

  const getAllModifications = () => {
    saveCurrentChanges()
    return Object.values(prestataireModifications)
  }

  const handleSubmitAll = () => {
    const allModifications = getAllModifications()
    // Logique pour envoyer les données
  }

  // ===========================
  // GESTION DES IMAGES
  // ===========================
  const openModalImage = () => setModalimage(true)
  const closeModalimage = () => setModalimage(false)

  const nextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % activeBadgeData?.all_imgs?.length,
    )
  }

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + activeBadgeData?.all_imgs?.length) %
        activeBadgeData?.all_imgs?.length,
    )
  }

  // ===========================
  // GESTION DES DOCUMENTS
  // ===========================
  const handleOpenPdf = async (pdfUri) => {
    try {
      let uriToOpen = pdfUri

      if (pdfUri.startsWith('http://') || pdfUri.startsWith('https://')) {
        const localUri = `${FileSystem.documentDirectory}temp.pdf`
        const { uri } = await FileSystem.downloadAsync(pdfUri, localUri)
        uriToOpen = uri
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uriToOpen)
      } else {
        showToast("❌ Impossible d'ouvrir le PDF", 'error')
      }
    } catch (error) {
      showToast("❌ Erreur lors de l'ouverture du PDF", 'error')
    }
  }

  const openDocument = async () => {
    if (activeBadgeData?.lien_brochure) {
      Linking.openURL(activeBadgeData?.lien_brochure)
    }
  }

  const openDevis = async (link) => {
    if (link) {
      Linking.openURL(link)
    }
  }

  // ===========================
  // GESTION DES BADGES
  // ===========================
  const deleteBadgeFromApi = async () => {
    try {
      setIsLoading(true)
      await deletePresta({
        id_deroule: item?.id_deroule,
        id_presta: activeBadgeData?.id_presta,
      })
      showToast('✅ Badge supprimé avec succès !', 'success')
    } catch (error) {
      console.error('ERREUR LORS DE LA SUPPRESSION DU BADGE :', error)
      showToast('❌ Erreur lors de la suppression du badge', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteBadge = async () => {
    if (badgeToDelete !== null) {
      setBadges((prevBadges) =>
        prevBadges.filter((_, index) => index !== badgeToDelete),
      )
      await deleteBadgeFromApi()

      if (badges.length === 1) {
        setActiveBadge(0)
      } else if (activeBadge === badgeToDelete + 1) {
        setActiveBadge(0)
      }

      await getData0()
      setModalVisible2(false)
      setBadgeToDelete(null)
    }
  }

  const getNextBadge = (badges, activeBadgeIndex) => {
    return badges.slice(activeBadgeIndex + 1)
  }

  const getPrevBadge = (badges, activeBadgeIndex) => {
    return badges.slice(0, activeBadgeIndex)
  }

  const handleSendDemand = async (all: boolean) => {
    try {
      let response

      if (all) {
        response = await sendDemandes({
          id_evt: idevt,
        })

        showToast('✅ Demande envoyée avec succès !', 'success')

        onRefresh()
      } else {
        response = await sendDemande({
          id_deroule: item?.id_deroule,
          id_presta: activeBadgeData?.id_presta,
          id_evt: idevt,
        })
        showToast('✅ Demande envoyée avec succès !', 'success')
        onRefresh()
      }
    } catch (error) {
      console.error('Erreur lors de la demande:', error)
      showToast('❌ Erreur lors de la demande', 'error')
    }
  }

  useEffect(() => {
    if (activeBadge > 0 && activeBadgeData) {
      // Chercher si les données ont été mises à jour
      const updatedPresta = item.all_presta_interroges?.find(
        (presta) => presta.nom_presta === activeBadgeData.nom_presta,
      )

      if (updatedPresta) {
        // Comparer pour voir si ça a changé
        const hasChanged =
          JSON.stringify(updatedPresta) !== JSON.stringify(activeBadgeData)

        if (hasChanged) {
          //          console.log('MISE À JOUR AUTOMATIQUE DES DONNÉES DU BADGE ACTIF')
          setActiveBadgeData(updatedPresta)
        }
      }
    }
  }, [item.all_presta_interroges]) // Se déclenche quand les données principales changent

  // ===========================
  // PARAMÈTRES
  // ===========================
  const NewDevisParam = {
    id_deroule: item?.id_deroule,
    id_presta: activeBadgeData?.id_presta,
  }

  // console.log(activeBadgeData)

  // ===========================
  // RENDU CONDITIONNEL
  // ===========================
  if (!item.all_presta_interroges || item.all_presta_interroges.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <TextBlock style={styles.errorText}>
          AUCUN PRESTATAIRE ASSOCIÉ À CE DÉROULÉ
        </TextBlock>
      </View>
    )
  }

  if (badges.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <TextBlock style={styles.errorText}>CHARGEMENT ...</TextBlock>
      </View>
    )
  }

  // ===========================
  // RENDU PRINCIPAL
  // ===========================
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modal PDF */}
      {false && (
        <PdfModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          pdfUri={pdfUri}
        />
      )}

      <View style={styles.container}>
        {/* Badges précédents */}
        {activeBadge > 0 &&
          getPrevBadge(badges, activeBadge - 1)?.map((badge, index) => (
            <Badge
              key={index}
              text={badge.text}
              badgeNumber={badge.number}
              badgeColor={badge.color}
              onPress={() => handleBadgeClick(index + 1, badge)}
              isActive={false}
            />
          ))}

        {/* Badges actifs */}
        {badges.length > 0 &&
          badges.map(
            (badge, index) =>
              (activeBadge === 0 || activeBadge === index + 1) && (
                <Badge
                  key={index}
                  text={badge.text}
                  badgeNumber={badge.number}
                  badgeColor={badge.color}
                  onPress={() => handleBadgeClick(index + 1, badge)}
                  onDelete={() => handleBadgeDelete(index)}
                  isActive={activeBadge === index + 1}
                />
              ),
          )}

        {/* Modal de confirmation pour la suppression */}
        <ConfirmationModal
          visible={modalVisible2}
          onClose={() => setModalVisible2(false)}
          onConfirm={confirmDeleteBadge}
          onCancel={() => setModalVisible2(false)}
          message="SUPPRIMER CE PRESTATAIRE ?"
        />

        {/* Contenu principal quand un badge est actif */}
        {activeBadge !== 0 && (
          <>
            <View style={styles.contentContainer}>
              {/* Section Demande */}
              <View style={styles.actionRow}>
                <Button
                  flex={1}
                  gradient={gradients.success}
                  rounded={false}
                  round={false}
                  onPress={() => handleSendDemand(false)}
                >
                  <Text
                    white
                    size={getFontSize(isSmallScreen ? 11 : 13)}
                    style={styles.buttonText}
                  >
                    ENVOYER
                  </Text>
                  <Text
                    white
                    size={getFontSize(isSmallScreen ? 11 : 13)}
                    style={styles.buttonText}
                  >
                    DEMANDE
                  </Text>
                </Button>
                <Button flex={1} style={styles.infoBox}>
                  <Text
                    black
                    size={getFontSize(isSmallScreen ? 10 : 11)}
                    style={styles.infoTitle}
                  >
                    DEMANDE ENVOYÉE
                  </Text>
                  <Text
                    color={colors.primary}
                    size={getFontSize(isSmallScreen ? 9 : 10)}
                    style={styles.infoValue}
                  >
                    {activeBadgeData?.date_demande_envoye &&
                    activeBadgeData.date_demande_envoye !=
                      '0000-00-00 00:00:00' &&
                    activeBadgeData.date_demande_envoye != '0000-00-00'
                      ? new Date(
                          activeBadgeData.date_demande_envoye,
                        ).toLocaleDateString()
                      : 'Aucun demande envoyée'}
                  </Text>
                </Button>
              </View>

              {/* Section Devis */}
              <View style={styles.actionRow}>
                <Button
                  flex={1}
                  gradient={gradients.secondary}
                  rounded={false}
                  round={false}
                  onPress={() => setModalFormDevis(true)}
                >
                  <Text
                    white
                    transform="uppercase"
                    size={getFontSize(isSmallScreen ? 11 : 13)}
                  >
                    INSÉRER
                  </Text>
                  <Text
                    white
                    size={getFontSize(isSmallScreen ? 11 : 13)}
                    style={styles.buttonText}
                  >
                    DEVIS
                  </Text>
                </Button>
                <Button flex={1} style={styles.infoBox}>
                  <Text
                    black
                    size={getFontSize(isSmallScreen ? 11 : 12)}
                    style={styles.infoTitle}
                  >
                    DEVIS REÇU LE
                  </Text>
                  <Text
                    color={colors.primary}
                    size={getFontSize(isSmallScreen ? 11 : 11)}
                    style={styles.infoValue}
                  >
                    {activeBadgeData?.date_devis_recu &&
                    activeBadgeData.date_devis_recu !== '0000-00-00 00:00:00' &&
                    activeBadgeData.date_devis_recu !== '0000-00-00'
                      ? new Date(
                          activeBadgeData.date_devis_recu,
                        ).toLocaleDateString()
                      : 'Aucun devis recu'}
                  </Text>
                </Button>
              </View>

              {/* Interface Devis */}
              <View>
                <DevisInterface
                  activeBadgeData={activeBadgeData}
                  gradients={gradients}
                  sizes={sizes}
                  getFontSize={getFontSize}
                  openDevis={openDevis}
                />

                {/* Section Brochure */}
                {activeBadgeData?.lien_brochure &&
                  activeBadgeData.lien_brochure !==
                    'https://www.goseminaire.com/crm/upload/' &&
                  activeBadgeData.lien_brochure.trim() !== '' && (
                    <>
                      <View style={styles.actionRow}>
                        <Button
                          flex={1}
                          gradient={gradients.info}
                          rounded={false}
                          round={false}
                          onPress={() => openDocument(activeBadgeData)}
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
                            size={getFontSize(isSmallScreen ? 11 : 13)}
                            style={styles.buttonText}
                          >
                            BROCHURE
                          </Text>
                        </Button>
                        <Button flex={1} style={styles.infoBox}>
                          <Dropdown
                            data={options}
                            onChange={(item) =>
                              handleOptionSelect(item.label, 2)
                            }
                            placeholder="VALIDER"
                          />
                        </Button>
                      </View>
                    </>
                  )}
                {/* Section Galerie et Budget */}
                <View style={styles.actionRow}>
                  <Button
                    flex={1}
                    gradient={gradients.info}
                    rounded={false}
                    round={false}
                    onPress={openModalImage}
                  >
                    <Text
                      white
                      size={getFontSize(isSmallScreen ? 11 : 13)}
                      style={styles.buttonText}
                    >
                      GALERIE
                    </Text>
                    <Text
                      white
                      size={getFontSize(isSmallScreen ? 11 : 13)}
                      style={styles.buttonText}
                    >
                      PHOTO
                    </Text>
                  </Button>
                  <Button flex={1} style={styles.infoBox}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                      }}
                    >
                      {' '}
                      <TextInput
                        style={{
                          fontSize: getFontSize(isSmallScreen ? 11 : 13),
                          textTransform: 'uppercase',
                          color: colors.primary,
                        }}
                        keyboardType="numeric"
                        value={formFields?.budget}
                        onChangeText={(text) =>
                          handleFieldChange('budget', text)
                        }
                        placeholder="Budget"
                      />
                      <Text
                        style={{
                          fontSize: getFontSize(isSmallScreen ? 11 : 13),
                          textTransform: 'uppercase',
                        }}
                        color={colors.primary}
                      >
                        €
                      </Text>
                    </View>
                  </Button>
                </View>

                {/* Modal Galerie d'images */}
                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={modalimage}
                  onRequestClose={closeModalimage}
                >
                  <View style={styles.modalBackdrop} />
                  <View style={styles.modalContainer}>
                    {activeBadgeData?.all_imgs &&
                    activeBadgeData?.all_imgs.length > 0 ? (
                      <>
                        <Image
                          source={{
                            uri:
                              activeBadgeData?.all_imgs[currentImageIndex]
                                .image,
                          }}
                          style={styles.image}
                          resizeMode="contain"
                        />
                        <View style={styles.navigationContainer}>
                          <TouchableOpacity
                            onPress={prevImage}
                            style={styles.navButton}
                          >
                            <Text
                              white
                              size={getFontSize(14)}
                              style={styles.upperCaseText}
                            >
                              PRÉCÉDENT
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={nextImage}
                            style={styles.navButton}
                          >
                            <Text
                              white
                              size={getFontSize(14)}
                              style={styles.upperCaseText}
                            >
                              SUIVANT
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <View style={styles.modalContainer}>
                        <Text
                          white
                          size={getFontSize(16)}
                          style={styles.upperCaseText}
                        >
                          IMAGE INDISPONIBLE
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={closeModalimage}
                      style={styles.closeButton}
                    >
                      <Text
                        white
                        size={getFontSize(14)}
                        style={styles.upperCaseText}
                      >
                        FERMER
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Modal>

                {/* Modal de confirmation générale */}
                <ConfirmationModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  message="VOUS ÊTES SUR LE POINT DE SUPPRIMER ?"
                />
              </View>

              {/* Section Notation */}
              <View style={styles.ratingSection}>
                {activeBadgeData.pouce_baisse == 0 &&
                activeBadgeData.pouce_leve == 0 ? (
                  <View style={styles.thumbBox}>
                    <Text style={{}}>Aucune reponse du client</Text>
                  </View>
                ) : (
                  <>
                    {/* Pouce baissé */}
                    {activeBadgeData.pouce_baisse > 0 && (
                      <View style={styles.thumbBox}>
                        <Font6
                          name="thumbs-down"
                          color={colors.danger}
                          size={getFontSize(isSmallScreen ? 18 : 23)}
                        />
                      </View>
                    )}

                    {/* Pouce levé */}
                    {activeBadgeData.pouce_leve > 0 && (
                      <View style={styles.thumbBox}>
                        <Font6
                          name="thumbs-up"
                          color={colors.success}
                          size={getFontSize(isSmallScreen ? 18 : 23)}
                        />
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Section Commission et Options */}
              <View style={styles.commissionRow}>
                <View style={styles.commissionBox}>
                  <Text
                    color={colors.dark}
                    style={{
                      textTransform: 'uppercase',
                    }}
                    size={getFontSize(isSmallScreen ? 10 : 11)}
                  >
                    COMMISSION:{' '}
                  </Text>
                  <Text
                    color={colors.primary}
                    style={{
                      fontSize: getFontSize(isSmallScreen ? 11 : 11),
                      textTransform: 'uppercase',
                    }}
                    size={getFontSize(isSmallScreen ? 10 : 11)}
                  >
                    {activeBadgeData.commission
                      ? activeBadgeData.commission
                      : 0}
                    %
                  </Text>
                </View>
                <View style={styles.optionBox}>
                  <Text
                    black
                    size={getFontSize(isSmallScreen ? 11 : 13)}
                    style={styles.upperCaseText}
                    size={getFontSize(isSmallScreen ? 10 : 11)}
                  >
                    OPTION :{' '}
                  </Text>
                  <Text
                    color={colors.primary}
                    size={getFontSize(isSmallScreen ? 9 : 11)}
                    style={styles.upperCaseText}
                  >
                    MULTI-OPTION
                  </Text>
                </View>
              </View>

              {/* Section Commentaires */}
              <View>
                <Input
                  multiline
                  numberOfLines={4}
                  style={styles.commentInput}
                  value={formFields.comment}
                  onChangeText={(text) => handleFieldChange('comment', text)}
                  placeholder="AUTRE PROPOSITION DE COMMISSION && COMMENTAIRES PRESTATAIRE"
                />
              </View>

              {/* Section Contacts */}
              <View style={styles.contactRow}>
                <View style={styles.contactInputContainer}>
                  <TextInputWithIcon
                    value={formFields.email}
                    onChangeText={(text) => handleFieldChange('email', text)}
                    placeholder="EMAIL PRESTATAIRE"
                  />
                </View>
                <View style={styles.contactInputContainer}>
                  <TextInputWithIcon
                    value={formFields.tel}
                    onChangeText={(text) => handleFieldChange('tel', text)}
                    placeholder="PRÉNOM & TÉLÉPHONE"
                  />
                </View>
              </View>
            </View>

            {/* Badges suivants */}
            {activeBadge > 0 &&
              getNextBadge(badges, activeBadge - 1)?.map((badge, index) => (
                <Badge
                  key={index}
                  text={badge.text}
                  badgeNumber={badge.number}
                  badgeColor={badge.color}
                  onPress={() =>
                    handleBadgeClick(activeBadge + index + 1, badge)
                  }
                  isActive={false}
                />
              ))}
          </>
        )}
      </View>

      {/* Bouton d'envoi global */}
      {activeBadge !== 0 && (
        <View style={styles.globalActionContainer}>
          <Button
            flex={1}
            width={getResponsiveWidth(isSmallScreen ? 80 : 70)}
            gradient={gradients.success}
            marginBottom={0}
            rounded={false}
            round={false}
            marginTop={sizes.base / 2}
            onPress={() => handleSendDemand(true)}
          >
            <Text
              white
              size={getFontSize(isSmallScreen ? 11 : 13)}
              style={styles.globalButtonText}
              h4
              center
            >
              ENVOYER DEMANDE À TOUS LES LIEUX
            </Text>
          </Button>
        </View>
      )}

      {/* Modal Form pour les devis */}
      {badges.map(
        (badge, index) =>
          (activeBadge === 0 || activeBadge === index + 1) && (
            <ModalForm
              key={index}
              visible={activeBadge !== 0 && modalFormDevis}
              onClose={() => setModalFormDevis(false)}
              onSubmit={onRefresh}
              formParam={NewDevisParam}
              badge={badge.text}
            />
          ),
      )}

      <ToastComponent />
    </SafeAreaView>
  )
}

// ===========================
// STYLES RESPONSIFS
// ===========================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: getResponsiveWidth(isSmallScreen ? 2 : 3),
    marginHorizontal: getResponsiveWidth(isSmallScreen ? 1 : 2.5),
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  contentContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    marginHorizontal: getResponsiveWidth(isSmallScreen ? 1 : 3.4),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveWidth(5),
  },
  errorText: {
    color: '#FF0000',
    fontSize: getFontSize(isSmallScreen ? 12 : 14),
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '',
  },
  actionRow: {
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
  upperCaseText: {
    textTransform: 'uppercase',
  },
  infoBox: {
    // flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    //  padding: getResponsiveWidth(1.5),
    //marginTop: isSmallScreen ? getResponsiveHeight(1) : 0,
  },
  infoTitle: {
    marginRight: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  infoValue: {
    maxWidth: '100%',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  dropdownContainer: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',

    borderRadius: 10,
    marginBottom: 3,
    height: getFontSize(isSmallScreen ? 40 : 44),
    paddingHorizontal: getResponsiveWidth(2),
    // marginTop: isSmallScreen ? getResponsiveHeight(1) : 0,
  },
  budgetBox: {
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: getResponsiveWidth(2),
    // paddingVertical: getResponsiveHeight(1),
    //marginBottom: 2,
    //  marginTop: isSmallScreen ? getResponsiveHeight(1) : 0,
    height: getFontSize(isSmallScreen ? 40 : 42),
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveWidth(5),
  },
  image: {
    width: getResponsiveWidth(90),
    height: getResponsiveHeight(isSmallScreen ? 50 : 60),
    borderRadius: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: getResponsiveWidth(5),
    position: 'absolute',
    bottom: getResponsiveHeight(8),
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: getResponsiveWidth(3),
    borderRadius: 5,
    minWidth: getResponsiveWidth(20),
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: getResponsiveHeight(6),
    right: getResponsiveWidth(5),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: getResponsiveWidth(3),
    borderRadius: 5,
  },
  ratingSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getResponsiveHeight(1),
    marginHorizontal: getResponsiveWidth(1),
    // gap: 10,
  },
  thumbBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: getResponsiveWidth(2),
    marginBottom: 2,
  },
  commissionRow: {
    flex: 1,
    flexDirection: isSmallScreen ? 'column' : 'row',
    // marginTop: getResponsiveHeight(1),
    marginHorizontal: getResponsiveWidth(1),
    gap: getResponsiveWidth(2),
  },
  commissionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: getResponsiveWidth(2),
    paddingVertical: getResponsiveHeight(2),
    marginBottom: 2,
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
  },
  optionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: getResponsiveWidth(2),
    paddingVertical: getResponsiveHeight(1),
    marginBottom: 2,
    marginHorizontal: isSmallScreen ? 0 : 0,
    flex: isSmallScreen ? 0 : 1,
    width: isSmallScreen ? '100%' : 'auto',
    marginTop: isSmallScreen ? getResponsiveHeight(1) : 0,
  },
  commentInput: {
    height: getResponsiveHeight(isSmallScreen ? 12 : 14),
    marginHorizontal: getResponsiveWidth(1),
    fontSize: getFontSize(12),
    textTransform: 'uppercase',
  },
  contactRow: {
    flex: 1,
    flexDirection: isSmallScreen ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: getResponsiveWidth(1),
    paddingHorizontal: getResponsiveWidth(1),
    gap: getResponsiveWidth(2),
  },
  contactInputContainer: {
    width: isSmallScreen ? '100%' : '50%',
  },
  globalActionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    marginHorizontal: getResponsiveWidth(isSmallScreen ? 5 : 15),
    paddingVertical: getResponsiveHeight(1),
  },
  globalButtonText: {
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: getFontSize(isSmallScreen ? 16 : 20),
  },
  label: {
    fontSize: getFontSize(16),
    marginVertical: getResponsiveHeight(1),
    textTransform: 'uppercase',
  },
  input: {
    height: getResponsiveHeight(6),
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: getResponsiveWidth(1),
    marginBottom: getResponsiveHeight(2),
    borderRadius: 10,
    padding: getResponsiveWidth(2),
    fontSize: getFontSize(14),
  },
  inputContainer: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    gap: getResponsiveWidth(1),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: getResponsiveHeight(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: getFontSize(18),
    textTransform: 'uppercase',
  },
  button: {
    paddingVertical: getResponsiveHeight(1.5),
    paddingHorizontal: getResponsiveWidth(6),
    borderRadius: 4,
    marginVertical: getResponsiveHeight(1),
  },
})

export default Form4
