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
import { useTranslation } from 'react-i18next'

const PAGE_SIZE = 30

// Composant pour l'indicateur de chargement avec message
const LoadingIndicator = React.memo(({ message, size = 'large' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color="#9932CC" size={size} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
))

// Composant pour l'état vide
const EmptyState = React.memo(({ message, onRetry }) => {
  const { t } = useTranslation()
  return (
    <View style={styles.emptyState}>
      <Icon name="people-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Icon name="refresh" size={20} color="#9932CC" />
          <Text style={styles.retryButtonText}>{t('clients.empty.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
})

export const Client = () => {
  const { getClient, udpateClient, deleteClient } = useApi()
  const { t } = useTranslation()

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
    updating: false, // Nouvel état pour les mises à jour
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

    // Vide les sélections précédentes (uniquement lors d'une nouvelle recherche)
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
        t('clients.alerts.searching'),
        t('clients.alerts.minChars'),
      )
      return
    }

    // Cleanup avant nouvelle recherche
    cleanupMemory()

    setLoadingState('searching', true)
    setSearchProgress(t('clients.loading.searching'))
    setCurrentPage(1)
    setHasMore(true)

    try {
      await fetchData(1, true)
      cleanupAfterSearch()
    } catch (error) {
      setSearchProgress(t('clients.alerts.errorSearch'))
      Alert.alert(
        t('common.error'),
        error.message || t('clients.alerts.errorSearch'),
      )
      cleanupMemory()
    } finally {
      setLoadingState('searching', false)
    }
  }, [searchQuery])

  // 📊 FONCTION FETCHDATA AMÉLIORÉE
  const fetchData = async (
    page = 1,
    isNewSearch = false,
    showProgress = true,
  ) => {
    try {
      if (isNewSearch && showProgress) {
        setSearchProgress(t('clients.loading.searching'))
      } else if (showProgress) {
        setSearchProgress(t('clients.loading.refreshing'))
      }

      const formattedData = {
        search: searchQuery.trim(),
        current_page: page,
      }

      console.log('🔍 Recherche avec paramètres:', formattedData)

      const response = await withTimeout(
        getClient(formattedData),
        'Recherche de clients',
      )

      console.log('📊 Réponse API:', response)

      if (!response.data) {
        setHasMore(false)
        if (isNewSearch) {
          setSearchResults({ all_clients: [], nb_tot_client: 0 })
        }
        return
      }

      const newData = response.data

      if (isNewSearch) {
        // Nouvelle recherche : remplace toutes les données
        setSearchResults(newData)
        setCurrentPage(page)
        if (showProgress) {
          setSearchProgress(`${newData.nb_tot_client} ${t('clients.results.found')}`)
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
            nb_tot_client: newData.nb_tot_client,
            all_clients: [...(prev?.all_clients || []), ...newData.all_clients],
          }))
          setCurrentPage(page)
        }
      }

      const totalPagesReceived = Math.ceil(newData.nb_tot_client / PAGE_SIZE)
      setHasMore(page < totalPagesReceived)

      console.log('✅ Données mises à jour avec succès')
    } catch (error) {
      console.error('🔴 Erreur lors de la recherche:', error)
      setHasMore(false)
      throw error
    }
  }

  // 🔄 FONCTION D'ACTUALISATION COMPLÈTE
  const refreshCurrentSearch = useCallback(async () => {
    if (!searchQuery.trim() || !searchResults) {
      console.log('⚠️ Aucune recherche à actualiser')
      return
    }

    console.log('🔄 Actualisation de la recherche courante...')
    setLoadingState('updating', true)

    try {
      // Recharge toutes les pages jusqu'à la page courante
      let allClients = []

      for (let page = 1; page <= currentPage; page++) {
        const formattedData = {
          search: searchQuery.trim(),
          current_page: page,
        }

        const response = await withTimeout(
          getClient(formattedData),
          `Actualisation page ${page}`,
        )

        if (response.data?.all_clients) {
          allClients = [...allClients, ...response.data.all_clients]
        }
      }

      // Met à jour les résultats avec toutes les données actualisées
      setSearchResults({
        all_clients: allClients,
        nb_tot_client: searchResults.nb_tot_client, // Garde le nombre total
      })

      setSearchProgress(t('clients.loading.success'))

      // Nettoie le message après 2 secondes
      setTimeout(() => {
        setSearchProgress(null)
      }, 2000)

      console.log('✅ Actualisation terminée')
    } catch (error) {
      console.error("🔴 Erreur lors de l'actualisation:", error)
      Alert.alert(t('common.error'), t('clients.alerts.errorRefresh'))
    } finally {
      setLoadingState('updating', false)
    }
  }, [searchQuery, searchResults, currentPage])

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

  // 🔧 ACTIONS CRUD OPTIMISÉES ET CORRIGÉES
  const onModify = useCallback(
    async (data) => {
      console.log('🔧 Modification du client:', data.id_client)
      setLoadingState('updating', true)

      try {
        const response = await udpateClient({
          id_client: data.id_client,
          ...data,
        })

        console.log('📝 Réponse modification:', response)

        if (response) {
          console.log('✅ Modification réussie, actualisation des données...')
          await refreshCurrentSearch()

          // Message de succès
          Alert.alert(t('common.success'), t('clients.alerts.modifySuccess'))
        } else {
          throw new Error('Réponse invalide du serveur')
        }
      } catch (error) {
        console.error('🔴 Erreur lors de la modification:', error)
        Alert.alert(
          t('common.error'),
          error.message || t('clients.alerts.errorUpdate'),
        )
      } finally {
        setLoadingState('updating', false)
      }
    },
    [refreshCurrentSearch],
  )

  const onDelete = useCallback(
    async (data) => {
      console.log('🗑️ Suppression du client:', data.id_client)

      // Confirmation avant suppression
      Alert.alert(
        t('common.confirmation'),
        t('clients.alerts.deleteConfirm'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              setLoadingState('updating', true)

              try {
                const response = await deleteClient({
                  id_client: data.id_client,
                })

                console.log('🗑️ Réponse suppression:', response)

                if (response) {
                  console.log(
                    '✅ Suppression réussie, actualisation des données...',
                  )

                  // Retire le client supprimé des sélections s'il y était
                  setSelectClient((prev) =>
                    prev.filter((selectedId) => selectedId !== data.id_client),
                  )

                  await refreshCurrentSearch()

                  // Message de succès
                  Alert.alert(t('common.success'), t('clients.alerts.deleteSuccess'))
                } else {
                  throw new Error('Réponse invalide du serveur')
                }
              } catch (error) {
                console.error('🔴 Erreur lors de la suppression:', error)
                Alert.alert(
                  t('common.error'),
                  error.message || t('clients.alerts.errorDelete'),
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
          <Text style={styles.title}>{t('clients.title')}</Text>

          {/* Indicateur de progression */}
          {(searchProgress ||
            showLongWaitMessage ||
            loadingStates.updating) && (
            <View style={styles.progressContainer}>
              <ActivityIndicator color="#9932CC" />
              <Text style={styles.progressText}>
                {loadingStates.updating
                  ? t('clients.loading.updating')
                  : searchProgress ||
                    t('clients.loading.longWait')}
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
                placeholder={t('clients.searchPlaceholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={submit}
                returnKeyType="search"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loadingStates.updating}
                placeholderTextColor={'#000'}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                  disabled={loadingStates.updating}
                >
                  <Icon name="close-circle" size={17} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Boutons d'action */}
            <View style={styles.buttonContainer}>
              <View style={styles.searchButtonContainer}>
                <Button
                  gradient={gradients.primary}
                  style={styles.searchButton}
                  onPress={submit}
                  disabled={
                    loadingStates.searching ||
                    loadingStates.updating ||
                    searchQuery.trim().length < 2
                  }
                >
                  {loadingStates.searching ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Icon name="search" size={18} color="white" />
                      <Text style={styles.searchButtonText}>{t('clients.search')}</Text>
                    </>
                  )}
                </Button>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                disabled={loadingStates.searching || loadingStates.updating}
              >
                <Icon name="refresh" size={30} color="#9932CC" />
              </TouchableOpacity>
            </View>

            {/* Résultats */}
            {searchResults !== null && (
              <Text style={styles.resultCount}>
                {t('clients.results.label')}
                <Text style={styles.resultCountHighlight}>
                  {searchResults.nb_tot_client}
                </Text>
                {t('clients.clientsCount')}
              </Text>
            )}

            {/* Sélections */}
            {selectClient?.length > 0 && (
              <View style={styles.selectionContainer}>
                <Icon name="checkmark-circle" size={20} color="#9932CC" />
                <Text style={styles.selectionText}>
                  <Text style={styles.resultCountHighlight}>
                    {selectClient.length}
                  </Text>
                  {t('clients.selectedCount')}
                </Text>
                <Button
                  gradient={gradients.success}
                  padding={8}
                  onPress={() => console.log('Validation:', selectClient)}
                  disabled={loadingStates.updating}
                >
                  <Text style={styles.searchButtonText}>{t('clients.validate')}</Text>
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
                      disabled={loadingStates.updating} // Désactive les actions pendant la mise à jour
                    />
                  ))
                ) : (
                  <EmptyState
                    message={t('clients.empty.noResults', { query: searchQuery })}
                    onRetry={submit}
                  />
                )}

                {loadingStates.loadingMore && hasMore && (
                  <LoadingIndicator
                    message={t('clients.loading.more')}
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
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#9932CC',
    borderRadius: 8,
    alignItems: 'center',
    width: 200,
    gap: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {
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
    fontWeight: '500',
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
    fontWeight: '600',
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
  searchButtonContainer: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 25,
  },
})

export default React.memo(Client)
