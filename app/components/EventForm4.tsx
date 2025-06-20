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

// ===========================
// CONSTANTES
// ===========================
const options = [
  { id: '1', label: 'oui' },
  { id: '2', label: 'non' },
  { id: '3', label: 'supprimer' },
]

const { width, height } = Dimensions.get('window')
const fontScale = PixelRatio.getFontScale()
const getFontSize = (size) => size / fontScale

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const Form4 = ({ item, onDataChange, getData0, onRefresh }) => {
  // ===========================
  // HOOKS & API
  // ===========================
  const { validdevis, validbrochure, sendDemande, deletePresta } = useApi()
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
        text: item.nom_presta,
        number: 0,
        color: item.color,
      }))
      setBadges(badges)
    }
  }, [item])

  // Mise à jour des champs quand on change de prestataire actif
  useEffect(() => {
    if (activeBadgeData) {
      const savedModifications =
        prestataireModifications[activeBadgeData.nom_presta]
      setFormFields({
        comment: savedModifications?.comment || activeBadgeData.comment || '',
        email: savedModifications?.email || activeBadgeData.email || '',
        tel: savedModifications?.contact || activeBadgeData.contact || '',
      })
    }
  }, [activeBadgeData])

  // Notification des changements
  useEffect(() => {
    if (prestataireModifications) {
      onDataChange(prestataireModifications)
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
  }

  const handleOptionSelect = async (option, type) => {
    if (type === 1) {
      if (option === 'supprimer') {
        validateForm(1)
      } else {
        setSelectedOption(option)
      }
    } else {
      if (option === 'supprimer') {
        validateForm(2)
      } else {
        await validbrochure({
          id_presta: activeBadgeData.id_presta,
          valid: option,
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
      (presta) => presta.nom_presta === value.text,
    )
    setActiveBadgeData(selectedPresta)
  }

  const handleBadgeDataWithPrestaName = (value) => {
    const selectedPresta = item.all_presta_interroges.find(
      (presta) => presta.nom_presta === value,
    )
    setActiveBadgeData(selectedPresta)
  }

  const handleBadgeDelete = (index) => {
    setBadgeToDelete(index)
    setModalVisible2(true)
  }

  const handleConfirm = async () => {
    if (currentForm === 1) {
      setSelectedOption('supprimer')
    } else if (currentForm === 2) {
      await validbrochure({
        id_presta: activeBadgeData?.id_presta,
        valid: 'supprimer',
      })
      setSelectedOption2('supprimer')
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
        console.log("Le partage n'est pas disponible sur cet appareil")
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture du PDF :", error)
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
      Alert.alert('Succès', 'Le badge a été supprimé avec succès.')
    } catch (error) {
      console.error('Erreur lors de la suppression du badge :', error)
      Alert.alert(
        'Erreur',
        'La suppression du badge a échoué. Veuillez réessayer.',
      )
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

  console.log('activeBadgeData', activeBadgeData)

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
          console.log('Mise à jour automatique des données du badge actif')
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

  // ===========================
  // RENDU CONDITIONNEL
  // ===========================
  if (!item.all_presta_interroges || item.all_presta_interroges.length === 0) {
    return (
      <View>
        <TextBlock style={styles.errorText}>
          Aucun prestataire associé à ce deroule
        </TextBlock>
      </View>
    )
  }

  if (badges.length === 0) {
    return (
      <View>
        <TextBlock style={styles.errorText}>chargement ...</TextBlock>
      </View>
    )
  }

  // ===========================
  // RENDU PRINCIPAL
  // ===========================
  return (
    <SafeAreaView>
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
          message="Voulez-vous vraiment supprimer ce badge ?"
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
                  onPress={async () =>
                    sendDemande({
                      id_presta: activeBadgeData?.id_presta,
                      id_deroule: item?.id_deroule,
                    })
                  }
                >
                  <Text
                    white
                    size={getFontSize(13)}
                    bold
                    style={styles.buttonText}
                  >
                    envoyer
                  </Text>
                  <Text
                    white
                    size={getFontSize(13)}
                    bold
                    style={styles.buttonText}
                  >
                    Demander
                  </Text>
                </Button>
                <View style={styles.infoBox}>
                  <Text
                    black
                    size={getFontSize(12)}
                    bold
                    style={styles.infoTitle}
                  >
                    DEMANDE ENVOYée LE
                  </Text>
                  <Text
                    color={colors.primary}
                    size={width * 0.027}
                    bold
                    style={styles.infoValue}
                  >
                    {new Date(
                      activeBadgeData?.date_demande_envoye,
                    ).toLocaleDateString()}
                  </Text>
                </View>
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
                  <Text white bold transform="uppercase" size={getFontSize(13)}>
                    Inserer
                  </Text>
                  <Text
                    white
                    size={getFontSize(13)}
                    bold
                    style={styles.buttonText}
                  >
                    devis
                  </Text>
                </Button>
                <View style={styles.infoBox}>
                  <Text
                    black
                    size={getFontSize(12)}
                    bold
                    style={styles.infoTitle}
                  >
                    DEVIS REcu LE
                  </Text>
                  <Text
                    color={colors.primary}
                    size={width * 0.027}
                    bold
                    style={styles.infoValue}
                  >
                    {new Date(
                      activeBadgeData?.date_devis_recu,
                    ).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Interface Devis */}
              <View style={{ flex: 1 }}>
                <DevisInterface
                  activeBadgeData={activeBadgeData}
                  gradients={gradients}
                  sizes={sizes}
                  getFontSize={getFontSize}
                  openDevis={openDevis}
                />

                {/* Section Brochure */}
                <View style={styles.actionRow}>
                  {activeBadgeData?.lien_brochure &&
                    activeBadgeData.lien_brochure !==
                      'https://www.goseminaire.com/crm/upload/' &&
                    activeBadgeData.lien_brochure.trim() !== '' && (
                      <>
                        <Button
                          flex={1}
                          gradient={gradients.info}
                          marginBottom={sizes.base / 2}
                          rounded={false}
                          round={false}
                          onPress={() => openDocument(activeBadgeData)}
                        >
                          <Text
                            white
                            size={getFontSize(13)}
                            bold
                            style={styles.buttonText}
                          >
                            ouvrir
                          </Text>
                          <Text
                            white
                            size={getFontSize(13)}
                            bold
                            style={styles.buttonText}
                          >
                            brochure
                          </Text>
                        </Button>
                        <View style={styles.dropdownContainer}>
                          <Dropdown
                            data={options}
                            onChange={(item) =>
                              handleOptionSelect(item.label, 2)
                            }
                            placeholder="valider"
                          />
                        </View>
                      </>
                    )}
                </View>

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
                      size={getFontSize(13)}
                      bold
                      style={styles.buttonText}
                    >
                      Galerie
                    </Text>
                    <Text
                      white
                      size={getFontSize(13)}
                      bold
                      style={styles.buttonText}
                    >
                      photo
                    </Text>
                  </Button>
                  <View style={styles.budgetBox}>
                    <Text color={colors.primary} bold style={{ fontSize: 20 }}>
                      {activeBadgeData?.budget} €
                    </Text>
                  </View>
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
                            <Text white size={getFontSize(16)} bold>
                              Précédent
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={nextImage}
                            style={styles.navButton}
                          >
                            <Text white size={getFontSize(16)} bold>
                              Suivant
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <View style={styles.modalContainer}>
                        <Text white size={getFontSize(16)} bold>
                          image indisponible
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={closeModalimage}
                      style={styles.closeButton}
                    >
                      <Text white size={getFontSize(16)} bold>
                        Fermer
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
                  message="vous ete sur le point de supprimer ?"
                />
              </View>

              {/* Section Notation */}
              <View style={styles.ratingSection}>
                <View style={styles.thumbBox}>
                  <Font6
                    name="thumbs-down"
                    color={colors.danger}
                    size={getFontSize(23)}
                  />
                </View>
              </View>

              {/* Section Commission et Options */}
              <View style={styles.commissionRow}>
                <View style={styles.commissionBox}>
                  <Text color={colors.dark} bold style={{ fontSize: 20 }}>
                    Commission:{' '}
                  </Text>
                  <Text color={colors.primary} bold style={{ fontSize: 20 }}>
                    0.5%
                  </Text>
                </View>
                <View style={styles.optionBox}>
                  <Text black bold size={getFontSize(12)}>
                    Option :{' '}
                  </Text>
                  <Text color={colors.primary} bold size={getFontSize(12)}>
                    Multi-Option
                  </Text>
                </View>
              </View>

              {/* Section Commentaires */}
              <View>
                <Input
                  multiline
                  numberOfLines={2}
                  style={styles.commentInput}
                  value={formFields.comment}
                  onChangeText={(text) => handleFieldChange('comment', text)}
                  placeholder="Autre proposition de commission && Commentaires prestataire"
                />
              </View>

              {/* Section Contacts */}
              <View style={styles.contactRow}>
                <View style={{ width: '50%' }}>
                  <TextInputWithIcon
                    value={formFields.email}
                    onChangeText={(text) => handleFieldChange('email', text)}
                    placeholder="email prestataire"
                  />
                </View>
                <View style={{ width: '50%' }}>
                  <TextInputWithIcon
                    value={formFields.contact}
                    onChangeText={(text) => handleFieldChange('contact', text)}
                    placeholder="Prenom & Telephone"
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
            width={'40%'}
            gradient={gradients.success}
            marginBottom={0}
            rounded={false}
            round={false}
            marginTop={sizes.base / 2}
          >
            <Text
              white
              size={getFontSize(15)}
              bold
              style={{ textTransform: 'uppercase' }}
              h5
              center
            >
              Envoyer demande à tous les lieux
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
    </SafeAreaView>
  )
}

// ===========================
// STYLES
// ===========================
const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  contentContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 20,
    textAlign: 'center',
  },
  actionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 5,
    marginVertical: 3,
  },
  buttonText: {
    textTransform: 'uppercase',
  },
  infoBox: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 3,
  },
  infoTitle: {
    marginRight: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  infoValue: {
    maxWidth: '100%',
    textAlign: 'center',
  },
  dropdownContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 1,
    borderRadius: 10,
    marginBottom: 5,
    height: getFontSize(48),
  },
  budgetBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 5,
    marginBottom: 2,
    width: '46%',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 50,
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  ratingSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginHorizontal: 5,
    gap: 10,
  },
  thumbBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 3,
    marginBottom: 2,
  },
  commissionRow: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 6,
    gap: 10,
  },
  commissionBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 2,
    flex: 1,
  },
  optionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 2,
    marginHorizontal: 4,
    flex: 0.75,
  },
  commentInput: {
    height: 70,
    marginHorizontal: 4,
  },
  contactRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  globalActionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    marginHorizontal: 100,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    height: height * 0.054,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 4,
    marginBottom: 16,
    borderRadius: 10,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    gap: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 18,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})

export default Form4
