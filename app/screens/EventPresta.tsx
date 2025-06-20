import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons' // Remplacez 'Ionicons' par l'icône de votre choix
import Select from 'react-select'

import { useTheme } from '../hooks'
import { Block, Button, Input, Image, Switch, Modal, Text } from '../components'
import {
  SwitchTextBox,
  TextInputWithIcon,
} from '../components/TextInputWithIcon'
import MultiSelect from '../components/MultiSelectBox'

import Form4 from '../components/EventForm4'
import Form5 from '../components/EventForm5'
import { AuthContext } from '../context/AuthContext'
import { useApi } from '../context/useApi'
import ModalPresta from '../components/ModalPresta'
import { useToast } from '../components/ToastComponent'

// import { Container } from './styles';
const { width, height } = Dimensions.get('window')
const options = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
  // Add more options as needed
]
const fontScale = PixelRatio.getFontScale()

const EventPresta: React.FC = ({ route, navigation }) => {
  const { item } = route.params
  const { showToast, ToastComponent } = useToast()
  const [refreshing, setRefreshing] = useState(false)

  // console.log(item)

  const handleGoBack = () => {
    navigation.goBack() // Retourne à l'écran précédent
  }
  const { getDerouler } = useApi()
  const [data0, setData0] = React.useState([])

  const { userdata, validForm } = useContext(AuthContext)
  const eventTypes = userdata.list_champ_dyn
  //console.log(eventTypes)

  const options = eventTypes?.map((libelle, index) => ({
    id: index + 1,
    libelle,
  }))

  const getButtonSize = () => {
    const buttonWidth = width * 0.3 // 30% de la largeur de l'écran
    const buttonHeight = height * 0.06 // 6% de la hauteur de l'écran
    return { width: buttonWidth, height: buttonHeight }
  }

  const getFontSize = (size: number) => size / fontScale

  const { assets, colors, gradients, sizes } = useTheme()
  const [step, setStep] = useState('deroule')
  const [data, setData] = React.useState([])

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const fadeAnim = useRef(new Animated.Value(1)).current // Valeur d'animation initiale
  const [derouleTitle, setDerouleTitle] = useState(item?.titre_deroule || '')

  const [formData, setFormData] = useState<any>({
    id_deroule: item?.id || 0,
    derouleTitle: item?.titre_deroule || '',
    numero_deroule: item?.numero_deroule,
    fields: [],
  })

  const getDerouleData0 = async () => {
    try {
      const response = await getDerouler({ id_deroule: item.id })
      console.log(response.data)

      const titleFromResponse =
        response.data?.titre_deroule || item?.titre_deroule || ''

      // Mise à jour centralisée
      setFormData((prevData) => ({
        ...prevData,
        derouleTitle: titleFromResponse,
        // Autres données si nécessaires
        fields: response.data?.fields || prevData.fields,
      }))

      setData0(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error)
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les données du déroulé. Veuillez réessayer.',
      )
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await getDerouleData0()
    } finally {
      setRefreshing(false)
    }
  }, [item])

  useEffect(() => {
    if (item?.id) {
      getDerouleData0()
    }
  }, [item])

  const handleDerouleTitleChange = useCallback((title: string) => {
    console.log('Titre saisi :', title)

    // Validation en temps réel
    const trimmedTitle = title.trim()

    setDerouleTitle(trimmedTitle)
    // Mettre à jour formData avec le nouveau titre
    setTimeout(() => {
      setFormData((prevData) => ({
        ...prevData,
        derouleTitle: trimmedTitle,
      }))
    }, 200)
  }, [])

  /*
  // console.log(data0)
  const handleDerouleTitleChange = (title: string) => {
    setDerouleTitle(title);
    // Mettre à jour formData avec le nouveau titre
    setFormData(prevData => ({
      ...prevData,
      derouleTitle: title
    }));
  };*/
  function getIds(items) {
    console.log(items)
    return items
      .map((item) => item.id) // Map array to only ids
      .filter((id) => id !== undefined && id !== null) // Filter out undefined or null ids
      .join(',') // Join ids with commas
  }

  const handleForm5DataChange = (data: any) => {
    setFormData({
      id_deroule: item?.id || 0,
      derouleTitle: formData.derouleTitle || '',
      numero_deroule: item?.numero_deroule,
      fields: data.fields,
      newPresta: getIds(prestataire),
    })
  }

  const handleForm4DataChange = (data: any) => {
    setFormData({
      ...data,
      newPresta: getIds(prestataire),
      derouleTitle: formData.derouleTitle || '',
    })
  }

  const handleSaveForm = async () => {
    if (!formData.derouleTitle.trim()) {
      showToast('❌ Le titre est requis', 'error')
      return
    }

    const payload = {
      ...formData,
      idevt: item.idevt ?? item?.fk_evt,
      id_deroule: item?.id,

      newPresta: prestataire
        .map((p) => p.selectedId)
        .filter(Boolean)
        .join(','),
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
    }
  }

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true)
        Animated.timing(fadeAnim, {
          toValue: 0, // Disparaît
          duration: 300, // Durée de l'animation en ms
          useNativeDriver: true,
        }).start()
      },
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(fadeAnim, {
          toValue: 1, // Réapparaît
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

  const [prestataire, setPrestataire] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  // console.log(prestataire)

  const addPrestataire = () => {
    setPrestataire((prev) => [
      ...prev,
      { key: Date.now().toString(), selectedId: null, nom: '' },
    ])
  }

  const removePrestataire = (id: number) => {
    // console.log(id)
    const newPrestataires = prestataire.filter((prest) => prest.id !== id)
    setPrestataire(newPrestataires)
    // console.log(prestataire)
  }

  const updatePrestataire = (
    selectedClient: { id: number; nom: string },
    rowKey: string,
  ) => {
    setPrestataire((prev) =>
      prev.map((item) =>
        item.key === rowKey
          ? { ...item, selectedId: selectedClient.id, nom: selectedClient.nom }
          : item,
      ),
    )
  }

  const renderClientItem = ({
    item: data,
    index,
  }: {
    item: any
    index: number
  }) => (
    <View key={index} style={styles.clientContainer}>
      <ModalPresta
        nom={data.nom}
        onSelectItem={(presta) => updatePrestataire(presta, data.key)}
        onClose={() => console.log('close')}
      />
      <TouchableOpacity
        onPress={() => {
          removePrestataire(data.id), console.log(data)
        }}
        style={{ paddingHorizontal: 10, paddingBottom: 5 }}
      >
        <TextField
          style={{ fontSize: 23, color: colors.primary, fontWeight: 'bold' }}
        >
          x
        </TextField>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
        marginTop: -sizes.sm,
        flexDirection: 'column',
      }}
    >
      <View style={{ marginHorizontal: 30 }}>
        <Button gradient={gradients.primary} marginBottom={sizes.base}>
          <Text white transform="uppercase" size={20}>
            {formData.derouleTitle || 'Ajouter un déroulé'}
          </Text>
        </Button>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            gap: 10,
            marginHorizontal: 5,
            marginVertical: 10,
          }}
        >
          <Button
            flex={0.4}
            gradient={gradients.secondary}
            marginBottom={sizes.base}
            rounded={true}
            round={false}
            style={{ borderColor: '#000' }}
            onPress={() => setStep('deroule')}
          >
            <Text white transform="uppercase" size={15}>
              Déroulé
            </Text>
          </Button>
          <Button
            flex={1}
            gradient={gradients.info}
            marginBottom={sizes.base}
            rounded={false}
            round={false}
            onPress={() => setStep('Presta')}
          >
            <Text white transform="uppercase" size={15}>
              Prestataires interrogés
            </Text>
          </Button>
        </View>
      </View>

      {step === 'deroule' && (
        <View
          style={{
            padding: 10,
            borderRadius: 10,
            marginHorizontal: 30,
            borderColor: '#ccc',
            borderWidth: 1,
          }}
        >
          <TextInput
            style={{
              color: 'black',
              fontSize: 18,
              textTransform: 'uppercase',
              textAlign: 'center',
              paddingVertical: 10,
            }}
            placeholder="Saisissez le titre de votre déroulé"
            placeholderTextColor="#999"
            value={derouleTitle}
            onChangeText={handleDerouleTitleChange}
            autoCorrect={false}
            spellCheck={false}
            keyboardType="default"
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={() => {
              Keyboard.dismiss()
            }}
            enablesReturnKeyAutomatically={true}
            maxLength={100} // Limite de caractères
            multiline={false}
            // Validation visuelle en temps réel
            onBlur={() => {
              if (!formData.derouleTitle.trim()) {
                showToast('⚠️ Le titre ne peut pas être vide', 'warning')
              }
            }}
          />
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
          <Form4
            item={data0}
            onDataChange={handleForm4DataChange}
            getData0={getDerouleData0}
            onRefresh={onRefresh}
          />
        )}

        {step === 'Presta' && (
          <>
            <View
              style={{
                flexDirection: 'row',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
            >
              <TextField
                style={{ fontSize: 16, color: colors.primary }}
                color={colors.primary}
              >
                Ajouter un prestataire interrogé
              </TextField>
              <Button
                flex={0.6}
                gradient={gradients.warning}
                marginBottom={sizes.base}
                rounded={false}
                round={false}
                style={{ marginTop: 10 }}
                onPress={addPrestataire}
              >
                <TextField style={{ fontSize: 16, color: 'white' }} white>
                  {' '}
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
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginHorizontal: 20,
              marginBottom: -15,
            }}
          >
            <Button
              flex={1}
              gradient={gradients.secondary}
              marginBottom={sizes.base / 1.5}
              rounded={false}
              round={false}
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
              rounded={false}
              round={false}
              height={35}
              onPress={handleSaveForm}
            >
              <Text white transform="uppercase" size={getFontSize(13)}>
                Sauvegarder
              </Text>
            </Button>
            <Button
              flex={1}
              gradient={gradients.info}
              marginBottom={sizes.base / 1.5}
              rounded={false}
              round={false}
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
                CHat
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
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1,
  },
  scrollViewContent: {
    padding: 6,
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
  inputContainer2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    gap: 4,
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
  clientInput: {
    flex: 1,
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Espacement égal entre les éléments
    alignItems: 'center',
    paddingHorizontal: 0, // Ajout de marges pour ne pas coller les TextInputs aux bords
    width: '100%',
    gap: 4,
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
export default EventPresta
