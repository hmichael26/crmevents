import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Platform,
  Animated,
  PixelRatio,
  FlatList,
  Text as TextField,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'

import { useTheme } from '../hooks'
import { Block, Button, Input, Image, Switch, Modal, Text } from '../components'
import Form4 from '../components/EventForm4'
import Form5 from '../components/EventForm5'
import { AuthContext } from '../context/AuthContext'
import { useApi } from '../context/useApi'
import ModalPresta from '../components/ModalPresta'
import { useToast } from '../components/ToastComponent'

const { width, height } = Dimensions.get('window')
const fontScale = PixelRatio.getFontScale()

// Types pour une meilleure type safety
interface PrestatireItem {
  key: string
  selectedId: number | null
  nom: string
  id?: number
}

interface FormData {
  id_deroule: number
  derouleTitle: string
  numero_deroule?: number
  fields: any[]
  newPresta?: string
}

const EventPresta: React.FC = ({ route, navigation }) => {
  const { item } = route.params
  console.log(item)
  const { showToast, ToastComponent } = useToast()
  const { getDerouler, createDerouler } = useApi()
  const { userdata, validForm } = useContext(AuthContext)
  const { assets, colors, gradients, sizes } = useTheme()

  // États principaux
  const [refreshing, setRefreshing] = useState(false)
  const [data0, setData0] = useState([])
  const [step, setStep] = useState('deroule')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const [prestataire, setPrestataire] = useState<PrestatireItem[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // État pour le titre avec validation
  const [derouleTitle, setDerouleTitle] = useState(item?.titre_deroule || '')
  const [titleError, setTitleError] = useState('')

  // FormData memoized pour éviter les re-rendus inutiles
  const [formData, setFormData] = useState<FormData>({
    id_deroule: item?.id || 0,
    derouleTitle: item?.titre_deroule || '',
    numero_deroule: item?.numero_deroule,
    fields: [],
  })

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current

  // Options memoized avec dépendances fixes
  const options = useMemo(() => {
    if (!userdata?.list_champ_dyn) return []
    return userdata.list_champ_dyn.map((libelle, index) => ({
      id: index + 1,
      libelle,
    }))
  }, [userdata?.list_champ_dyn])

  // Fonctions utilitaires memoized
  const getButtonSize = useCallback(() => {
    const buttonWidth = width * 0.3
    const buttonHeight = height * 0.06
    return { width: buttonWidth, height: buttonHeight }
  }, [])

  const getFontSize = useCallback((size: number) => size / fontScale, [])

  const getIds = useCallback(
    (items: PrestatireItem[]) =>
      items
        .map((item) => item.id)
        .filter((id) => id !== undefined && id !== null)
        .join(','),
    [],
  )

  // Validation du titre - appelée uniquement quand nécessaire
  const validateTitle = useCallback((title: string) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setTitleError('Le titre ne peut pas être vide')
      return false
    }

    if (trimmedTitle.length < 3) {
      setTitleError('Le titre doit contenir au moins 3 caractères')
      return false
    }

    if (trimmedTitle.length > 100) {
      setTitleError('Le titre ne peut pas dépasser 100 caractères')
      return false
    }

    setTitleError('')
    return true
  }, [])

  // Gestion du changement de titre - validation simple sans debounce
  const handleDerouleTitleChange = useCallback((title: string) => {
    setDerouleTitle(title)

    // Validation basique uniquement pour l'affichage
    if (title.trim() && title.length >= 3) {
      setTitleError('')
    }
  }, [])

  // Mise à jour du formData quand le titre change (avec debounce) - SUPPRIMÉ POUR ÉVITER FUITE MÉMOIRE
  // La mise à jour se fait maintenant uniquement lors de la validation manuelle

  // Récupération des données optimisée
  const getDerouleData = useCallback(
    async (derouleId?: string) => {
      const targetId = derouleId || item?.id
      if (!targetId) return

      try {
        const response = await getDerouler({ id_deroule: targetId })
        const responseData = response.data

        if (responseData) {
          const titleFromResponse =
            responseData.titre_deroule || item?.titre_deroule || ''

          setDerouleTitle(titleFromResponse)
          setFormData((prevData) => ({
            ...prevData,
            derouleTitle: titleFromResponse,
            fields: responseData.fields || prevData.fields,
          }))
          setData0(responseData)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error)
        showToast('❌ Erreur lors du chargement des données', 'error')
      }
    },
    [item?.id, item?.titre_deroule, getDerouler, showToast],
  )

  // Rafraîchissement optimisé - dépendances simplifiées
  const onRefresh = useCallback(async () => {
    if (!item?.id) return

    setRefreshing(true)
    try {
      await getDerouleData()
    } finally {
      setRefreshing(false)
    }
  }, [item?.id]) // Suppression de getDerouleData

  // Création du déroulé optimisée
  const handleCreateDeroule = useCallback(async () => {
    if (!validateTitle(derouleTitle)) {
      showToast(`⚠️ ${titleError}`, 'warning')
      return
    }

    setIsCreating(true)

    try {
      const response = await createDerouler({
        idevt: item.idevt,
        derouleTitle: derouleTitle,
      })

      if (response.code === 'SUCCESS') {
        showToast('✅ Déroulé créé avec succès !', 'success')

        // Navigation vers le nouveau déroulé
        const newItem = {
          id: response.data.id_deroule, // "1149"
          isNew: false, // false
          fk_evt: item?.idevt || item?.fk_evt, // "624"
          idevt: item?.idevt || item?.fk_evt, // Compatibilité
          //  numero_deroule: response.data.numero_deroule || '1', // "3"
          titre_deroule: derouleTitle, // "ETETUEtu0"
          comm_deroule: '', // ""
          titre_evt: item?.titre_evt || '', // ""
        }

        navigation.replace('EventPresta', { item: newItem })
      } else {
        throw new Error(response.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur création déroulé:', error)
      showToast('❌ Erreur lors de la création du déroulé', 'error')
    } finally {
      setIsCreating(false)
    }
  }, [
    derouleTitle,
    validateTitle,
    titleError,
    item,
    createDerouler,
    showToast,
    navigation,
  ])

  // Gestion des prestataires optimisée
  const addPrestataire = useCallback(() => {
    setPrestataire((prev) => [
      ...prev,
      { key: Date.now().toString(), selectedId: null, nom: '' },
    ])
  }, [])

  const removePrestataire = useCallback((id: number) => {
    setPrestataire((prev) => prev.filter((prest) => prest.id !== id))
  }, [])

  const updatePrestataire = useCallback(
    (selectedClient: { id: number; nom: string }, rowKey: string) => {
      setPrestataire((prev) =>
        prev.map((item) =>
          item.key === rowKey
            ? {
                ...item,
                selectedId: selectedClient.id,
                nom: selectedClient.nom,
              }
            : item,
        ),
      )
    },
    [],
  )

  // Sauvegarde optimisée - validation au moment de la sauvegarde
  const handleSaveForm = useCallback(async () => {
    // Validation du titre au moment de la sauvegarde
    if (!validateTitle(derouleTitle)) {
      showToast(`❌ ${titleError || 'Le titre est requis'}`, 'error')
      return
    }
    setIsSaving(true)

    // Mise à jour du formData avec les dernières valeurs
    const finalFormData = {
      ...formData,
      derouleTitle: derouleTitle,
      newPresta: prestataire
        .map((p) => p.selectedId)
        .filter(Boolean)
        .join(','),
    }

    const payload = {
      ...finalFormData,
      idevt: item.idevt ?? item?.fk_evt,
      id_deroule: item?.id,
    }

    try {
      await validForm({ data: payload })
      setPrestataire([])
      showToast('✅ Données sauvegardées avec succès !', 'success')
      await onRefresh()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      const errorMessage = error.message || 'Erreur lors de la sauvegarde'
      showToast(`❌ ${errorMessage}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }, [
    derouleTitle,
    formData,
    prestataire,
    item,
    validateTitle,
    titleError,
    validForm,
    showToast,
    onRefresh,
  ])

  // Gestion des changements de données des formulaires - dépendances simplifiées
  const handleForm5DataChange = useCallback((data: any) => {
    setFormData((prevData) => ({
      ...prevData,
      fields: data.fields,
    }))
  }, [])

  const handleForm4DataChange = useCallback((data: any) => {
    setFormData((prevData) => ({
      ...prevData,
      ...data,
    }))
  }, [])

  // Navigation
  const handleGoBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  // Gestion du clavier
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true)
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      },
    )

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setKeyboardVisible(false)
        })
      },
    )

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [fadeAnim])

  // Chargement initial - dépendances stables
  useEffect(() => {
    if (item?.id && !item.isNew) {
      getDerouleData()
    }
  }, [item?.id, item?.isNew]) // Suppression de getDerouleData des dépendances

  // Rendu des éléments prestataires
  const renderClientItem = useCallback(
    ({ item: data, index }: { item: any; index: number }) => (
      <View key={index} style={styles.clientContainer}>
        <ModalPresta
          nom={data.nom}
          onSelectItem={(presta) => updatePrestataire(presta, data.key)}
          onClose={() => console.log('close')}
        />
        <TouchableOpacity
          onPress={() => removePrestataire(data.id)}
          style={{ paddingHorizontal: 10, paddingBottom: 5 }}
        >
          <TextField
            style={{ fontSize: 23, color: colors.primary, fontWeight: 'bold' }}
          >
            ×
          </TextField>
        </TouchableOpacity>
      </View>
    ),
    [updatePrestataire, removePrestataire, colors.primary],
  )

  // Rendu conditionnel pour la création
  if (item.isNew) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Button gradient={gradients.primary} marginBottom={sizes.base}>
            <Text white transform="uppercase" size={20}>
              Créer un nouveau déroulé
            </Text>
          </Button>

          <View style={styles.inputContainer}>
            <View
              style={[styles.inputWrapper, titleError && styles.inputError]}
            >
              <TextInput
                style={styles.textInput}
                placeholder="Saisissez le titre de votre déroulé"
                placeholderTextColor="#999"
                value={derouleTitle}
                onChangeText={handleDerouleTitleChange}
                blurOnSubmit={true}
                onSubmitEditing={() => Keyboard.dismiss()}
                onBlur={() => validateTitle(derouleTitle)} // Validation au blur
                returnKeyType="done"
                editable={!isCreating}
                maxLength={100}
              />
            </View>
          </View>

          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}

          <View style={styles.titleCounter}>
            <Text style={styles.counterText}>
              {derouleTitle.length}/100 caractères
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              gradient={gradients.primary}
              style={[
                styles.createButton,
                (isCreating || !derouleTitle.trim() || titleError) &&
                  styles.createButtonDisabled,
              ]}
              onPress={handleCreateDeroule}
              disabled={isCreating || !derouleTitle.trim() || !!titleError}
            >
              {isCreating ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={styles.loader}
                  />
                  <Text color={'#fff'}>Création en cours...</Text>
                </View>
              ) : (
                <Text color={'#fff'}>Créer le déroulé</Text>
              )}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // Rendu principal
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ marginHorizontal: 30 }}>
        <Button gradient={gradients.primary} marginBottom={sizes.base}>
          <Text white transform="uppercase" size={20}>
            {formData.derouleTitle || 'Déroulé'}
          </Text>
        </Button>

        <View style={styles.tabContainer}>
          <Button
            flex={0.4}
            gradient={
              step === 'deroule' ? gradients.secondary : gradients.light
            }
            marginBottom={sizes.base}
            rounded={true}
            onPress={() => setStep('deroule')}
          >
            <Text
              white={step === 'deroule'}
              black={step !== 'deroule'}
              transform="uppercase"
              size={15}
            >
              Déroulé
            </Text>
          </Button>
          <Button
            flex={1}
            gradient={step === 'Presta' ? gradients.info : gradients.light}
            marginBottom={sizes.base}
            onPress={() => setStep('Presta')}
          >
            <Text
              white={step === 'Presta'}
              black={step !== 'Presta'}
              transform="uppercase"
              size={15}
            >
              Prestataires interrogés
            </Text>
          </Button>
        </View>
      </View>

      {step === 'deroule' && (
        <View style={styles.titleEditContainer}>
          <TextInput
            style={[styles.titleInput, titleError && styles.inputError]}
            placeholder="Saisissez le titre de votre déroulé"
            placeholderTextColor="#999"
            value={derouleTitle}
            onChangeText={handleDerouleTitleChange}
            blurOnSubmit={true}
            onSubmitEditing={() => Keyboard.dismiss()}
            onBlur={() => validateTitle(derouleTitle)} // Validation au blur
            maxLength={100}
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}
        </View>
      )}

      <ScrollView
        style={{ flex: 1, paddingBottom: 25 }}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {step === 'deroule' && (
          <Form5
            options={options}
            onDataChange={handleForm5DataChange}
            item={data0?.fields}
          />
        )}

        {step === 'Presta' && (
          <>
            <Form4
              item={data0}
              onDataChange={handleForm4DataChange}
              getData0={getDerouleData}
              onRefresh={onRefresh}
            />

            <View style={styles.prestataireSection}>
              <TextField style={styles.prestataireTitle}>
                Ajouter un prestataire interrogé
              </TextField>
              <Button
                flex={0.5}
                gradient={gradients.warning}
                marginBottom={sizes.base}
                onPress={addPrestataire}
              >
                <TextField style={{ fontSize: 16, color: 'white' }}>
                  + Ajouter
                </TextField>
              </Button>
            </View>

            <FlatList
              data={prestataire}
              renderItem={renderClientItem}
              keyExtractor={(client) => client.key}
              contentContainerStyle={styles.clientListContainer}
            />
          </>
        )}
      </ScrollView>

      {!isKeyboardVisible && (
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <View style={styles.footerButtons}>
            <Button
              flex={1}
              gradient={gradients.secondary}
              marginBottom={sizes.base / 1.5}
              height={35}
              onPress={handleGoBack}
            >
              <Text white transform="uppercase" size={getFontSize(13)}>
                Retour
              </Text>
            </Button>
            <Button
              flex={1}
              gradient={gradients.warning}
              marginBottom={sizes.base / 1.5}
              height={35}
              onPress={handleSaveForm}
              disabled={isSaving}
              style={[isSaving && styles.createButtonDisabled]}
            >
              {isSaving ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={styles.loader}
                  />
                  <Text white transform="uppercase" size={getFontSize(11)}>
                    Sauvegarde...
                  </Text>
                </View>
              ) : (
                <Text white transform="uppercase" size={getFontSize(13)}>
                  Sauvegarder
                </Text>
              )}
            </Button>
            <Button
              flex={1}
              gradient={gradients.info}
              marginBottom={sizes.base / 1.5}
              height={35}
              onPress={() =>
                navigation.navigate('Chat', {
                  idevt: item?.fk_evt,
                  admin: userdata?.user?.admin,
                  id_deroule: item?.id,
                })
              }
            >
              <Text white transform="uppercase" size={getFontSize(13)}>
                Chat
              </Text>
            </Button>
          </View>
        </Animated.View>
      )}

      <ToastComponent />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -20,
    flexDirection: 'column',
  },
  content: {
    marginHorizontal: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    gap: 4,
  },
  inputWrapper: {
    flex: 1,
    padding: 6,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginHorizontal: 5,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  textInput: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 10,
    minHeight: 40,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  titleCounter: {
    alignItems: 'center',
    marginTop: 5,
  },
  counterText: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  createButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.7,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginRight: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
    marginHorizontal: 5,
    marginVertical: 10,
  },
  titleEditContainer: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 30,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  titleInput: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 10,
  },
  scrollViewContent: {
    padding: 6,
  },
  prestataireSection: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  prestataireTitle: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  clientListContainer: {
    paddingBottom: 20,
  },
  clientContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 25,
    flex: 1,
  },
  footer: {
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: -15,
  },
})

export default EventPresta
