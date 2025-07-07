import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/Ionicons'
import { AuthContext } from '../context/AuthContext'
import { useApi } from '../context/useApi'
import { ProviderCard } from '../components/ProviderCard'
import { Button } from '../components'
import { useTheme } from '../hooks'
import DeroulesModal from '../components/DeroulesModal'
import { useNavigation } from '@react-navigation/native'

const initialFormState = {
  region: '',
  department: '',
  city: '',
  providerType: '',
  postalCode: '',
  minRooms: '',
  maxRooms: '',
  nom: '',
}
const PAGE_SIZE = 30

// Composant léger pour l'indicateur de chargement
const LoadingIndicator = React.memo(({ message, size = 'large' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color="#9932CC" size={size} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
))

// Composant pour l'état vide
const EmptyState = React.memo(({ message }) => (
  <View style={styles.emptyState}>
    <Icon name="search-outline" size={60} color="#ccc" />
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
))

export const Prestataire = () => {
  const {
    getPrestaBy,
    updatepresta,
    deletepresta,
    getprestaprms,
    assignPresta,
  } = useApi()

  const navigation = useNavigation()
  const scrollViewRef = useRef(null)
  const { gradients } = useTheme()

  // Refs pour les timeouts
  const timeoutRefs = useRef({})
  const abortControllers = useRef({})

  // États principaux - optimisés
  const [searchProgress, setSearchProgress] = useState(null)
  const [assignProgress, setAssignProgress] = useState(null)
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false)

  // Données des dropdowns avec lazy loading
  const [dropdownData, setDropdownData] = useState({
    regions: [],
    departments: [],
    cities: [],
    providerTypes: [],
  })

  // États de chargement centralisés
  const [loadingStates, setLoadingStates] = useState({
    regions: false,
    departments: false,
    cities: false,
    providerTypes: false,
    searching: false,
    loadingMore: false,
    assigning: false,
    updating: false, // Nouvel état pour les mises à jour
  })

  // États de recherche
  const [searchResults, setSearchResults] = useState(null)
  const [selectForm, setSelectForm] = useState(initialFormState)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectPresta, setSelectPresta] = useState([])
  const [modalShow, setModalShow] = useState(false)

  // 🧹 FONCTION DE NETTOYAGE MÉMOIRE
  const cleanupMemory = useCallback(() => {
    console.log('🧹 Prestataire - Nettoyage mémoire en cours...')

    // Nettoie les timeouts
    Object.values(timeoutRefs.current).forEach(clearTimeout)
    timeoutRefs.current = {}

    // Annule les requêtes en cours
    Object.values(abortControllers.current).forEach((controller) => {
      if (controller?.abort) controller.abort()
    })
    abortControllers.current = {}

    // Reset des états de progression
    setSearchProgress(null)
    setAssignProgress(null)
    setShowLongWaitMessage(false)

    console.log('✅ Prestataire - Mémoire nettoyée')
  }, [])

  // 🔄 NETTOYAGE APRÈS RECHERCHE
  const cleanupAfterSearch = useCallback(() => {
    console.log('🔄 Prestataire - Nettoyage post-recherche...')

    // Vide les sélections précédentes
    setSelectPresta([])

    // Reset pagination
    setCurrentPage(1)
    setHasMore(true)

    // Nettoie les états de progression
    setTimeout(() => {
      setSearchProgress(null)
    }, 2000)

    console.log('✅ Prestataire - Nettoyage post-recherche terminé')
  }, [])

  // 🗑️ NETTOYAGE APRÈS ASSIGNATION
  const cleanupAfterAssignment = useCallback(() => {
    console.log('🗑️ Prestataire - Nettoyage post-assignation...')

    // Vide complètement les sélections
    setSelectPresta([])

    // Ferme la modal
    setModalShow(false)

    // Reset des résultats de recherche pour forcer une nouvelle recherche
    setSearchResults(null)

    // Nettoie les états
    setTimeout(() => {
      setAssignProgress(null)
    }, 2000)

    console.log('✅ Prestataire - Nettoyage post-assignation terminé')
  }, [])

  // Helper pour les états de chargement
  const setLoadingState = useCallback((key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Helper pour les données dropdown
  const setDropdownDataKey = useCallback((key, data) => {
    setDropdownData((prev) => ({ ...prev, [key]: data }))
  }, [])

  // 🚀 GESTION TIMEOUT AVEC CLEANUP
  const withTimeout = useCallback(
    async (promise, operation, timeoutMs = 70000) => {
      const operationId = Date.now().toString()

      // Crée un AbortController pour cette opération
      const controller = new AbortController()
      abortControllers.current[operationId] = controller

      // Timer pour le message d'attente longue
      const longWaitTimeout = setTimeout(() => {
        setShowLongWaitMessage(true)
      }, 5000)
      timeoutRefs.current[`longWait_${operationId}`] = longWaitTimeout

      try {
        const result = await Promise.race([
          promise,
          new Promise((_, reject) => {
            const timeoutId = setTimeout(() => {
              controller.abort()
              reject(
                new Error(`${operation} - Timeout après ${timeoutMs / 1000}s`),
              )
            }, timeoutMs)
            timeoutRefs.current[`timeout_${operationId}`] = timeoutId
          }),
        ])

        // Cleanup pour cette opération
        clearTimeout(timeoutRefs.current[`longWait_${operationId}`])
        clearTimeout(timeoutRefs.current[`timeout_${operationId}`])
        delete timeoutRefs.current[`longWait_${operationId}`]
        delete timeoutRefs.current[`timeout_${operationId}`]
        delete abortControllers.current[operationId]

        setShowLongWaitMessage(false)
        return result
      } catch (error) {
        // Cleanup en cas d'erreur
        clearTimeout(timeoutRefs.current[`longWait_${operationId}`])
        clearTimeout(timeoutRefs.current[`timeout_${operationId}`])
        delete timeoutRefs.current[`longWait_${operationId}`]
        delete timeoutRefs.current[`timeout_${operationId}`]
        delete abortControllers.current[operationId]

        setShowLongWaitMessage(false)

        if (error.name === 'AbortError') {
          throw new Error(`${operation} - Opération annulée`)
        }
        throw error
      }
    },
    [],
  )

  // 📋 HANDLERS DROPDOWN OPTIMISÉS
  const createDropdownHandler = useCallback(
    (type, searchBy) => {
      return async () => {
        if (dropdownData[type].length > 0 || loadingStates[type]) return

        setLoadingState(type, true)
        try {
          const response = await withTimeout(
            getprestaprms({ searchby: searchBy }),
            `Chargement ${type}`,
          )

          const dataKey = {
            regions: 'all_regions',
            departments: 'all_depts',
            cities: 'all_cities',
            providerTypes: 'all_categories',
          }[type]

          setDropdownDataKey(type, response.data[dataKey] || [])
        } catch (error) {
          console.error(`Erreur ${type}:`, error)
          Alert.alert(
            'Erreur',
            error.message || `Impossible de charger ${type}`,
          )
        } finally {
          setLoadingState(type, false)
        }
      }
    },
    [
      dropdownData,
      loadingStates,
      withTimeout,
      setLoadingState,
      setDropdownDataKey,
    ],
  )

  // Handlers spécifiques
  const handleRegionFocus = useMemo(
    () => createDropdownHandler('regions', 'region'),
    [createDropdownHandler],
  )
  const handleDepartmentFocus = useMemo(
    () => createDropdownHandler('departments', 'dept'),
    [createDropdownHandler],
  )
  const handleCityFocus = useMemo(
    () => createDropdownHandler('cities', 'ville'),
    [createDropdownHandler],
  )
  const handleProviderTypeFocus = useMemo(
    () => createDropdownHandler('providerTypes', 'categ'),
    [createDropdownHandler],
  )

  // 🎯 GESTION SÉLECTIONS OPTIMISÉE
  const handleSelect = useCallback((item) => {
    setSelectPresta((prev) => {
      if (!prev.includes(item)) {
        return [...prev, item]
      }
      return prev
    })
  }, [])

  const handleUnselect = useCallback((item) => {
    setSelectPresta((prev) =>
      prev.filter((selectedItem) => selectedItem !== item),
    )
  }, [])

  const isSelected = useCallback(
    (id) => {
      return selectPresta.some((selectId) => selectId == id)
    },
    [selectPresta],
  )

  const handleInputChange = useCallback((name, value) => {
    setSelectForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  // 🔍 FONCTION DE RECHERCHE OPTIMISÉE
  const submit = useCallback(async () => {
    // Cleanup avant nouvelle recherche
    cleanupMemory()

    setLoadingState('searching', true)
    setSearchProgress('Préparation de la recherche...')
    setCurrentPage(1)
    setHasMore(true)

    try {
      await fetchData(1, true)
      cleanupAfterSearch()
    } catch (error) {
      setSearchProgress('Erreur lors de la recherche')
      Alert.alert('Erreur', error.message || 'Erreur lors de la recherche')
      cleanupMemory()
    } finally {
      setLoadingState('searching', false)
    }
  }, [selectForm])

  // 📊 FONCTION FETCHDATA AMÉLIORÉE
  const fetchData = async (
    page = 1,
    isNewSearch = false,
    showProgress = true,
  ) => {
    try {
      if (isNewSearch && showProgress) {
        setSearchProgress('Recherche des prestataires...')
      } else if (showProgress) {
        setSearchProgress('Actualisation des données...')
      }

      const filteredForm = Object.fromEntries(
        Object.entries(selectForm).filter(([_, value]) => value !== ''),
      )

      const mappedKeys = {
        providerType: 'fk_type',
        postalCode: 'cp',
        minRooms: 'nb_chbre',
        maxRooms: 'nb_salle',
        nom: 'nom',
        city: 'fk_ville',
        department: 'fk_departement',
        region: 'fk_region',
      }

      const formattedData = {
        ...Object.entries(filteredForm).reduce((acc, [key, value]) => {
          const newKey = mappedKeys[key] || key
          acc[newKey] = value
          return acc
        }, {}),
        current_page: page,
      }

      console.log('🔍 Recherche prestataires avec paramètres:', formattedData)

      const response = await withTimeout(
        getPrestaBy(formattedData),
        'Recherche de prestataires',
      )

      console.log('📊 Réponse API prestataires:', response)

      if (!response.data) {
        setHasMore(false)
        if (isNewSearch) {
          setSearchResults({ all_prests: [], nb_tot_presta: 0 })
        }
        return
      }

      const newData = response.data

      if (isNewSearch) {
        // Nouvelle recherche : remplace toutes les données
        setSearchResults(newData)
        setCurrentPage(page)
        if (showProgress) {
          setSearchProgress(`${newData.nb_tot_presta} prestataires trouvés`)
        }
      } else {
        // Actualisation : garde les données existantes ou les remplace selon le contexte
        if (page === 1) {
          // Si on actualise la première page, on remplace tout
          setSearchResults(newData)
          setCurrentPage(1)
        } else {
          // Chargement de pages supplémentaires
          setSearchResults((prev) => ({
            nb_tot_presta: newData.nb_tot_presta,
            all_prests: [...(prev?.all_prests || []), ...newData.all_prests],
          }))
          setCurrentPage(page)
        }
      }

      const totalPagesReceived = Math.ceil(newData.nb_tot_presta / PAGE_SIZE)
      setHasMore(page < totalPagesReceived)

      console.log('✅ Données prestataires mises à jour avec succès')
    } catch (error) {
      console.error('🔴 Erreur lors de la recherche prestataires:', error)
      setHasMore(false)
      throw error
    }
  }

  // 🔄 FONCTION D'ACTUALISATION COMPLÈTE
  const refreshCurrentSearch = useCallback(async () => {
    if (!searchResults) {
      console.log('⚠️ Aucune recherche prestataire à actualiser')
      return
    }

    console.log('🔄 Actualisation de la recherche prestataires courante...')
    setLoadingState('updating', true)

    try {
      // Recharge toutes les pages jusqu'à la page courante
      let allPrestataires = []

      for (let page = 1; page <= currentPage; page++) {
        const filteredForm = Object.fromEntries(
          Object.entries(selectForm).filter(([_, value]) => value !== ''),
        )

        const mappedKeys = {
          providerType: 'fk_type',
          postalCode: 'cp',
          minRooms: 'nb_chbre',
          maxRooms: 'nb_salle',
          nom: 'nom',
          city: 'fk_ville',
          department: 'fk_departement',
          region: 'fk_region',
        }

        const formattedData = {
          ...Object.entries(filteredForm).reduce((acc, [key, value]) => {
            const newKey = mappedKeys[key] || key
            acc[newKey] = value
            return acc
          }, {}),
          current_page: page,
        }

        const response = await withTimeout(
          getPrestaBy(formattedData),
          `Actualisation page ${page}`,
        )

        if (response.data?.all_prests) {
          allPrestataires = [...allPrestataires, ...response.data.all_prests]
        }
      }

      // Met à jour les résultats avec toutes les données actualisées
      setSearchResults({
        all_prests: allPrestataires,
        nb_tot_presta: searchResults.nb_tot_presta, // Garde le nombre total
      })

      setSearchProgress('Données prestataires actualisées avec succès')

      // Nettoie le message après 2 secondes
      setTimeout(() => {
        setSearchProgress(null)
      }, 2000)

      console.log('✅ Actualisation prestataires terminée')
    } catch (error) {
      console.error("🔴 Erreur lors de l'actualisation prestataires:", error)
      Alert.alert(
        'Erreur',
        "Impossible d'actualiser les données des prestataires",
      )
    } finally {
      setLoadingState('updating', false)
    }
  }, [selectForm, searchResults, currentPage])

  // 📄 PAGINATION OPTIMISÉE
  const handleScroll = useCallback(
    async (event) => {
      if (loadingStates.loadingMore || !hasMore || loadingStates.updating)
        return

      const {
        layoutMeasurement,
        contentOffset,
        contentSize,
      } = event.nativeEvent
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height * 0.8

      if (isCloseToBottom) {
        try {
          setLoadingState('loadingMore', true)
          const nextPage = currentPage + 1
          await fetchData(nextPage, false, false)
        } catch (error) {
          console.error('Error loading more data:', error)
        } finally {
          setLoadingState('loadingMore', false)
        }
      }
    },
    [currentPage, hasMore, loadingStates.loadingMore, loadingStates.updating],
  )

  // 🎯 ASSIGNATION OPTIMISÉE
  const assignEvent = useCallback(
    async (selectedArrDeroule, selectedDeroule) => {
      setLoadingState('assigning', true)
      setAssignProgress("Préparation de l'assignation...")

      try {
        const eventData = {
          eventId: selectedDeroule.id,
          presta: selectPresta,
        }

        setAssignProgress(
          "Assignation en cours... Cela peut prendre jusqu'à 60 secondes.",
        )

        const response = await withTimeout(
          assignPresta(eventData),
          'Assignation des prestataires',
        )

        if (response.code === 'SUCCESS') {
          setAssignProgress('Assignation réussie !')

          // Nettoyage complet après assignation réussie
          cleanupAfterAssignment()

          // Navigation après cleanup
          setTimeout(() => {
            navigation.navigate('EventPresta', { item: response.data })
          }, 1000)
        } else {
          throw new Error("Échec de l'assignation")
        }
      } catch (error) {
        Alert.alert(
          'Erreur',
          error.message || "Une erreur est survenue lors de l'assignation.",
        )
        console.error(error)
        cleanupMemory()
      } finally {
        setLoadingState('assigning', false)
      }
    },
    [selectPresta, cleanupAfterAssignment, cleanupMemory],
  )

  // 🔧 ACTIONS CRUD OPTIMISÉES ET CORRIGÉES
  const onModify = useCallback(
    async (data) => {
      console.log('🔧 Modification du prestataire:', data.id)
      setLoadingState('updating', true)

      try {
        const response = await updatepresta(data)

        console.log('📝 Réponse modification prestataire:', response)

        if (response) {
          console.log(
            '✅ Modification prestataire réussie, actualisation des données...',
          )
          await refreshCurrentSearch()

          // Message de succès
          Alert.alert('Succès', 'Prestataire modifié avec succès')
        } else {
          throw new Error('Réponse invalide du serveur')
        }
      } catch (error) {
        console.error('🔴 Erreur lors de la modification prestataire:', error)
        Alert.alert(
          'Erreur',
          error.message || 'Impossible de modifier le prestataire',
        )
      } finally {
        setLoadingState('updating', false)
      }
    },
    [refreshCurrentSearch],
  )

  const onDelete = useCallback(
    async (data) => {
      console.log('🗑️ Suppression du prestataire:', data.id)

      // Confirmation avant suppression
      Alert.alert(
        'Confirmation',
        'Êtes-vous sûr de vouloir supprimer ce prestataire ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              setLoadingState('updating', true)

              try {
                const response = await deletepresta(data)

                console.log('🗑️ Réponse suppression prestataire:', response)

                if (response) {
                  console.log(
                    '✅ Suppression prestataire réussie, actualisation des données...',
                  )

                  // Retire le prestataire supprimé des sélections s'il y était
                  setSelectPresta((prev) =>
                    prev.filter((selectedId) => selectedId !== data.id),
                  )

                  await refreshCurrentSearch()

                  // Message de succès
                  Alert.alert('Succès', 'Prestataire supprimé avec succès')
                } else {
                  throw new Error('Réponse invalide du serveur')
                }
              } catch (error) {
                console.error(
                  '🔴 Erreur lors de la suppression prestataire:',
                  error,
                )
                Alert.alert(
                  'Erreur',
                  error.message || 'Impossible de supprimer le prestataire',
                )
              } finally {
                setLoadingState('updating', false)
              }
            },
          },
        ],
      )
    },
    [refreshCurrentSearch],
  )

  // 🧹 CLEANUP AU DÉMONTAGE
  useEffect(() => {
    return () => {
      console.log('🧹 Prestataire - Cleanup au démontage du composant')
      cleanupMemory()
    }
  }, [cleanupMemory])

  // 🚨 CLEANUP SUR CHANGEMENT DE NAVIGATION
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.log('🚨 Prestataire - Navigation blur - nettoyage')
      cleanupMemory()
    })

    return unsubscribe
  }, [navigation, cleanupMemory])

  // 🎯 FONCTION DE RESET
  const handleReset = useCallback(() => {
    cleanupMemory()
    setSearchResults(null)
    setSelectForm(initialFormState)
    setSelectPresta([])
    setCurrentPage(1)
    setHasMore(true)
  }, [cleanupMemory])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
      >
        <View style={styles.content}>
          <Text style={styles.title}>PRESTATAIRES</Text>

          {/* Indicateur de progression */}
          {(searchProgress ||
            assignProgress ||
            showLongWaitMessage ||
            loadingStates.updating) && (
            <View style={styles.progressContainer}>
              <ActivityIndicator color="#9932CC" />
              <Text style={styles.progressText}>
                {loadingStates.updating
                  ? 'Mise à jour en cours...'
                  : assignProgress ||
                    searchProgress ||
                    'La requête prend plus de temps que prévu... Veuillez patienter.'}
              </Text>
            </View>
          )}

          <View style={styles.searchSection}>
            <View style={styles.row}>
              <PickerWrapper
                selectedValue={selectForm.region}
                onValueChange={(value) => handleInputChange('region', value)}
                items={dropdownData.regions}
                placeholder="Sélectionner une région"
                onFocus={handleRegionFocus}
                loading={loadingStates.regions}
                disabled={loadingStates.updating}
              />
              <PickerWrapper
                selectedValue={selectForm.department}
                onValueChange={(value) =>
                  handleInputChange('department', value)
                }
                items={dropdownData.departments}
                placeholder="Sélectionner un département"
                onFocus={handleDepartmentFocus}
                loading={loadingStates.departments}
                disabled={loadingStates.updating}
              />
            </View>

            <View style={styles.row}>
              <PickerWrapper
                selectedValue={selectForm.city}
                onValueChange={(value) => handleInputChange('city', value)}
                items={dropdownData.cities}
                placeholder="Sélectionner une ville"
                onFocus={handleCityFocus}
                loading={loadingStates.cities}
                disabled={loadingStates.updating}
              />
              <PickerWrapper
                selectedValue={selectForm.providerType}
                onValueChange={(value) =>
                  handleInputChange('providerType', value)
                }
                items={dropdownData.providerTypes}
                placeholder="Type de prestataire"
                onFocus={handleProviderTypeFocus}
                loading={loadingStates.providerTypes}
                disabled={loadingStates.updating}
              />
            </View>

            <View style={styles.row}>
              <CustomTextInput
                placeholder="Code Postal"
                value={selectForm.postalCode}
                onChangeText={(text) => handleInputChange('postalCode', text)}
                keyboardType="numeric"
                editable={!loadingStates.updating}
              />
              <CustomTextInput
                placeholder="Nb de chambre min."
                value={selectForm.minRooms}
                onChangeText={(text) => handleInputChange('minRooms', text)}
                keyboardType="numeric"
                editable={!loadingStates.updating}
              />
              <CustomTextInput
                placeholder="Nb de salle min."
                value={selectForm.maxRooms}
                onChangeText={(text) => handleInputChange('maxRooms', text)}
                keyboardType="numeric"
                editable={!loadingStates.updating}
              />
            </View>

            <View style={styles.searchSection}>
              {/* Champ de recherche unique */}
              <View style={styles.searchInputContainer}>
                <Icon
                  name="person-outline"
                  size={20}
                  color="#9932CC"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nom du prestataire"
                  value={selectForm.nom}
                  onChangeText={(text) => handleInputChange('nom', text)}
                  onSubmitEditing={submit}
                  returnKeyType="search"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loadingStates.updating}
                />

                {selectForm.nom.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setSelectForm({ ...selectForm, nom: '' })}
                    disabled={loadingStates.updating}
                  >
                    <Icon name="close-circle" size={17} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <View style={styles.searchButtonContainer}>
                <Button
                  gradient={gradients.primary}
                  style={styles.searchButton}
                  onPress={submit}
                  disabled={loadingStates.searching || loadingStates.updating}
                >
                  {loadingStates.searching ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Icon name="search" size={18} color="white" />
                      <Text style={styles.searchButtonText}>Rechercher</Text>
                    </>
                  )}
                </Button>
              </View>

              <TouchableOpacity
                onPress={handleReset}
                disabled={loadingStates.searching || loadingStates.updating}
              >
                <Icon name="refresh" size={30} color="#9932CC" />
              </TouchableOpacity>
            </View>

            {/* Résultats */}
            {searchResults !== null && (
              <Text style={styles.resultCount}>
                Resultat de recherche :{' '}
                <Text style={styles.resultCountHighlight}>
                  {searchResults.nb_tot_presta}
                </Text>{' '}
                prestataires.
              </Text>
            )}

            {selectPresta?.length > 0 && (
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionText}>
                  <Text style={styles.resultCountHighlight}>
                    {selectPresta.length}
                  </Text>{' '}
                  prestataires sélectionnés.
                </Text>
                <Button
                  gradient={gradients.primary}
                  padding={5}
                  onPress={() => setModalShow(true)}
                  disabled={loadingStates.assigning || loadingStates.updating}
                >
                  <Text style={styles.searchButtonText}>Valider</Text>
                </Button>
              </View>
            )}

            {/* Liste des prestataires */}
            {searchResults !== null && (
              <>
                {searchResults.all_prests?.length > 0 ? (
                  searchResults.all_prests.map((provider, index) => (
                    <ProviderCard
                      key={`${provider.id}-${index}`}
                      provider={provider}
                      onModify={onModify}
                      onDelete={onDelete}
                      handleSelect={handleSelect}
                      handleUnSelect={handleUnselect}
                      isSelected={isSelected}
                      disabled={loadingStates.updating} // Désactive les actions pendant la mise à jour
                    />
                  ))
                ) : (
                  <EmptyState message="Aucun prestataire trouvé pour cette recherche." />
                )}

                {loadingStates.loadingMore && hasMore && (
                  <LoadingIndicator
                    message="Chargement des prestataires suivants..."
                    size="small"
                  />
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <DeroulesModal
        isVisible={modalShow}
        onClose={() => setModalShow(false)}
        onAssign={assignEvent}
      />
    </SafeAreaView>
  )
}

// 🎯 COMPOSANTS OPTIMISÉS AVEC MEMO
const PickerWrapper = React.memo(
  ({
    selectedValue,
    onValueChange,
    items,
    placeholder,
    onFocus,
    loading,
    disabled,
  }) => (
    <View style={[styles.pickerContainer, { width: '50%' }]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        onFocus={onFocus}
        enabled={!disabled}
      >
        <Picker.Item label={loading ? 'Chargement...' : placeholder} value="" />
        {!loading &&
          items.map((item, index) => (
            <Picker.Item
              label={item.name || item.libelle}
              value={item.id}
              key={`${item.id}-${index}`}
            />
          ))}
      </Picker>
      {loading && (
        <ActivityIndicator
          style={styles.pickerLoading}
          color="#9932CC"
          size="small"
        />
      )}
    </View>
  ),
)

const CustomTextInput = React.memo(({ ...props }) => (
  <TextInput style={[styles.input, styles.inputHalf]} {...props} />
))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    color: '#9932CC',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchSection: {
    gap: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  selectionContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  selectionText: {
    marginTop: 2,
    textAlign: 'center',
  },
  pickerLoading: {
    position: 'absolute',
    right: 30,
    top: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    padding: 5,
    borderColor: '#ddd',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    height: 45,
    backgroundColor: '#f8f9fa',
  },
  picker: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputHalf: {
    flex: 1,
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#9932CC',
    borderRadius: 8,
    alignItems: 'center',
    width: 200,
    gap: 10,
    marginVertical: 5,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCount: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  resultCountHighlight: {
    color: '#9932CC',
    fontWeight: 'bold',
    fontSize: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  searchButtonContainer: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 25,
  },
})

export default React.memo(Prestataire)
