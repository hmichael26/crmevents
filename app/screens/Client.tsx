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
import Icon from 'react-native-vector-icons/Ionicons'
import { AuthContext } from '../context/AuthContext'
import { useApi } from '../context/useApi'
import { ClientCard } from '../components/ClientCard'
import { Button } from '../components'
import { useTheme } from '../hooks'
import { useNavigation } from '@react-navigation/native'

const PAGE_SIZE = 30

// Composant pour l'indicateur de chargement avec message
const LoadingIndicator = React.memo(({ message, size = 'large' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color="#9932CC" size={size} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
))

// Composant pour l'état vide
const EmptyState = React.memo(({ message, onRetry }) => (
  <View style={styles.emptyState}>
    <Icon name="people-outline" size={80} color="#ccc" />
    <Text style={styles.emptyStateText}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Icon name="refresh" size={20} color="#9932CC" />
        <Text style={styles.retryButtonText}>Réessayer</Text>
      </TouchableOpacity>
    )}
  </View>
))

export const Client = () => {
  const { getClient, updateClient, deleteClient } = useApi()

  const navigation = useNavigation()
  const scrollViewRef = useRef(null)
  const { gradients, colors } = useTheme()

  // Refs pour le cleanup
  const timeoutRefs = useRef({})
  const abortControllers = useRef({})

  // États de progression
  const [searchProgress, setSearchProgress] = useState(null)
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false)

  // États principaux optimisés
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectClient, setSelectClient] = useState([])

  // États de chargement centralisés
  const [loadingStates, setLoadingStates] = useState({
    searching: false,
    loadingMore: false,
  })

  // 🧹 FONCTION DE NETTOYAGE MÉMOIRE
  const cleanupMemory = useCallback(() => {
    console.log('🧹 Client - Nettoyage mémoire en cours...')

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
    setShowLongWaitMessage(false)

    console.log('✅ Client - Mémoire nettoyée')
  }, [])

  // 🔄 NETTOYAGE APRÈS RECHERCHE
  const cleanupAfterSearch = useCallback(() => {
    console.log('🔄 Client - Nettoyage post-recherche...')

    // Vide les sélections précédentes
    setSelectClient([])

    // Reset pagination
    setCurrentPage(1)
    setHasMore(true)

    // Nettoie les états de progression
    setTimeout(() => {
      setSearchProgress(null)
    }, 2000)

    console.log('✅ Client - Nettoyage post-recherche terminé')
  }, [])

  // Helper pour les états de chargement
  const setLoadingState = useCallback((key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }))
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

  // 🎯 GESTION SÉLECTIONS OPTIMISÉE
  const handleSelect = useCallback((item) => {
    setSelectClient((prev) => {
      if (!prev.includes(item)) {
        return [...prev, item]
      }
      return prev
    })
  }, [])

  const handleUnselect = useCallback((item) => {
    setSelectClient((prev) =>
      prev.filter((selectedItem) => selectedItem !== item),
    )
  }, [])

  const isSelected = useCallback(
    (id) => {
      return selectClient.some((selectId) => selectId == id)
    },
    [selectClient],
  )

  // 🔍 FONCTION DE RECHERCHE OPTIMISÉE
  const submit = useCallback(async () => {
    // Vérifie qu'il y a au moins 2 caractères
    if (searchQuery.trim().length < 2) {
      Alert.alert(
        'Recherche',
        'Veuillez saisir au moins 2 caractères pour la recherche.',
      )
      return
    }

    // Cleanup avant nouvelle recherche
    cleanupMemory()

    setLoadingState('searching', true)
    setSearchProgress('Recherche en cours...')
    setCurrentPage(1)
    setHasMore(true)

    try {
      await fetchData(1, true)
      cleanupAfterSearch()
    } catch (error) {
      setSearchProgress('Erreur lors de la recherche')
      Alert.alert(
        'Erreur',
        error.message || 'Erreur lors de la recherche des clients',
      )
      cleanupMemory()
    } finally {
      setLoadingState('searching', false)
    }
  }, [searchQuery])

  const fetchData = async (page, isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setSearchProgress(`Recherche de "${searchQuery}"...`)
      }

      const formattedData = {
        search: searchQuery.trim(),
        current_page: page,
      }

      const response = await withTimeout(
        getClient(formattedData),
        'Recherche de clients',
      )

      console.log(response)

      if (!response.data) {
        setHasMore(false)
        if (isNewSearch) {
          setSearchResults({ all_clients: [], nb_tot_client: 0 })
        }
        return
      }

      const newData = response.data

      if (isNewSearch) {
        setSearchResults(newData)
        setSearchProgress(`${newData.nb_tot_client} clients trouvés`)
      } else {
        setSearchResults((prev) => ({
          nb_tot_client: newData.nb_tot_client,
          all_clients: [...(prev?.all_clients || []), ...newData.all_clients],
        }))
      }

      const totalPagesReceived = Math.ceil(newData.nb_tot_client / PAGE_SIZE)
      setHasMore(page < totalPagesReceived)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setHasMore(false)
      throw error
    }
  }

  // 📄 PAGINATION OPTIMISÉE
  const handleScroll = useCallback(
    async (event) => {
      if (loadingStates.loadingMore || !hasMore) return

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
          await fetchData(nextPage, false)
          setCurrentPage(nextPage)
        } catch (error) {
          console.error('Error loading more data:', error)
        } finally {
          setLoadingState('loadingMore', false)
        }
      }
    },
    [currentPage, hasMore, loadingStates.loadingMore],
  )

  // 🔧 ACTIONS CRUD OPTIMISÉES
  const onModify = useCallback(
    async (data) => {
      try {
        const response = await updateClient(data)
        if (response) {
          await fetchData(currentPage, true)
        }
      } catch (error) {
        console.error('Erreur lors de la modification:', error)
        Alert.alert('Erreur', 'Impossible de modifier le client')
      }
    },
    [currentPage],
  )

  const onDelete = useCallback(
    async (data) => {
      try {
        await deleteClient(data)
        await fetchData(currentPage, true)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        Alert.alert('Erreur', 'Impossible de supprimer le client')
      }
    },
    [currentPage],
  )

  // 🧹 CLEANUP AU DÉMONTAGE
  useEffect(() => {
    return () => {
      console.log('🧹 Client - Cleanup au démontage du composant')
      cleanupMemory()
    }
  }, [cleanupMemory])

  // 🚨 CLEANUP SUR CHANGEMENT DE NAVIGATION
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.log('🚨 Client - Navigation blur - nettoyage')
      cleanupMemory()
    })

    return unsubscribe
  }, [navigation, cleanupMemory])

  // 🎯 FONCTION DE RESET
  const handleReset = useCallback(() => {
    cleanupMemory()
    setSearchResults(null)
    setSearchQuery('')
    setSelectClient([])
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
          <Text style={styles.title}>CLIENTS</Text>

          {/* Indicateur de progression */}
          {(searchProgress || showLongWaitMessage) && (
            <View style={styles.progressContainer}>
              <ActivityIndicator color="#9932CC" />
              <Text style={styles.progressText}>
                {searchProgress ||
                  'La requête prend plus de temps que prévu... Veuillez patienter.'}
              </Text>
            </View>
          )}

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
                placeholder="Nom du client (min. 2 caractères)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={submit}
                returnKeyType="search"
                autoCapitalize="words"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Icon name="close-circle" size={17} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Boutons d'action */}
            <View style={styles.buttonContainer}>
              <Button
                gradient={gradients.primary}
                style={styles.searchButton}
                onPress={submit}
                disabled={
                  loadingStates.searching || searchQuery.trim().length < 2
                }
              >
                {loadingStates.searching ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Icon name="search" size={18} color="white" />
                    <Text style={styles.searchButtonText}>Rechercher</Text>
                  </>
                )}
              </Button>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                disabled={loadingStates.searching}
              >
                <Icon name="refresh" size={30} color="#9932CC" />
              </TouchableOpacity>
            </View>

            {/* Résultats */}
            {searchResults !== null && (
              <Text style={styles.resultCount}>
                Résultat de recherche :{' '}
                <Text style={styles.resultCountHighlight}>
                  {searchResults.nb_tot_client}
                </Text>{' '}
                clients.
              </Text>
            )}

            {/* Sélections */}
            {selectClient?.length > 0 && (
              <View style={styles.selectionContainer}>
                <Icon name="checkmark-circle" size={20} color="#9932CC" />
                <Text style={styles.selectionText}>
                  <Text style={styles.resultCountHighlight}>
                    {selectClient.length}
                  </Text>{' '}
                  clients sélectionnés.
                </Text>
                <Button
                  gradient={gradients.success}
                  padding={8}
                  onPress={() => console.log('Validation:', selectClient)}
                >
                  <Text style={styles.searchButtonText}>Valider</Text>
                </Button>
              </View>
            )}

            {/* Liste des clients */}
            {searchResults !== null && (
              <>
                {searchResults.all_clients?.length > 0 ? (
                  searchResults.all_clients.map((client, index) => (
                    <ClientCard
                      key={`${client.id}-${index}`}
                      client={client}
                      onModify={onModify}
                      onDelete={onDelete}
                      handleSelect={handleSelect}
                      handleUnSelect={handleUnselect}
                      isSelected={isSelected}
                    />
                  ))
                ) : (
                  <EmptyState
                    message={`Aucun client trouvé pour "${searchQuery}".`}
                    onRetry={submit}
                  />
                )}

                {loadingStates.loadingMore && hasMore && (
                  <LoadingIndicator
                    message="Chargement des clients suivants..."
                    size="small"
                  />
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

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
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  searchSection: {
    gap: 14,
    paddingHorizontal: 2,
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#9932CC',
    borderRadius: 8,

    alignItems: 'center',
    width: 150,
    gap: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '',
  },
  resetButton: {
    padding: 8,
    borderRadius: 25,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
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
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9932CC',
  },
  retryButtonText: {
    color: '#9932CC',
    fontWeight: '',
  },
  resultCount: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  resultCountHighlight: {
    color: '#9932CC',
    fontWeight: '',
    fontSize: 18,
  },
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  selectionText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
})

export default React.memo(Client)
