'use client'

import type React from 'react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  PixelRatio,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ClientPrestaCard from '../components/ClientPrestaCard'
import { useApi } from '../context/useApi'
import { Block, Button } from '../components'
import { useTheme } from '../hooks'
import { Feather } from '@expo/vector-icons'

// Types pour une meilleure sécurité
interface Deroule {
  id: string | number
  titre_deroule: string
  numero_deroule?: string
}

interface RouteParams {
  item: {
    idevt: string | number
    clt_id: string | number
    arrderoules: Deroule[]
  }
}

interface ClientPrestaProps {
  route: { params: RouteParams }
  navigation: any
}

interface ErrorState {
  message: string
  type: 'network' | 'server' | 'data'
  details?: string
}

const { width, height } = Dimensions.get('window')
const fontScale = PixelRatio.getFontScale()

// Fonctions responsives améliorées et étendues
const getFontSize = (size: number) => {
  const scale = width / 375 // Base sur iPhone X
  const newSize = size * scale
  return Math.max(newSize / fontScale, size * 0.8) // Taille minimum
}

const getResponsiveWidth = (percentage: number) => width * (percentage / 100)
const getResponsiveHeight = (percentage: number) => height * (percentage / 100)

// Responsive spacing
const getResponsiveSpacing = (baseSize: number) => {
  const scale = Math.min(width / 375, height / 812)
  return Math.max(baseSize * scale, baseSize * 0.7)
}

// Responsive padding/margin
const getResponsivePadding = (size: number) => {
  if (width < 350) return size * 0.8
  if (width > 400) return size * 1.2
  return size
}

// Breakpoints responsifs étendus
const isSmallScreen = width < 350
const isMediumScreen = width >= 350 && width < 400
const isLargeScreen = width >= 400
const isTablet = width >= 768

// Responsive values based on screen size
const getTabPadding = () => {
  if (isSmallScreen) return { horizontal: 8, vertical: 4 }
  if (isMediumScreen) return { horizontal: 12, vertical: 6 }
  if (isLargeScreen) return { horizontal: 16, vertical: 8 }
  return { horizontal: 20, vertical: 10 }
}

const getTabMargin = () => {
  if (isSmallScreen) return 6
  if (isMediumScreen) return 8
  if (isLargeScreen) return 10
  return 12
}

const getContainerPadding = () => {
  if (isSmallScreen) return 12
  if (isMediumScreen) return 16
  if (isLargeScreen) return 20
  return 24
}

const ClientPresta: React.FC<ClientPrestaProps> = ({ route, navigation }) => {
  const { colors, sizes, gradients } = useTheme()
  const { getDerouler } = useApi()
  const { item } = route.params

  // États principaux
  const [activeDeroule, setActiveDeroule] = useState<Deroule | null>(null)
  const [deroulerData, setDeroulerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Memoized déroulés list avec validation
  const derouler = useMemo(() => {
    if (!item?.arrderoules || !Array.isArray(item.arrderoules)) {
      console.warn('⚠️ Aucun déroulé trouvé dans item.arrderoules')
      return []
    }
    return item.arrderoules.filter((d) => d && d.id && d.titre_deroule)
  }, [item?.arrderoules])

  // Initialisation du déroulé actif
  useEffect(() => {
    if (derouler.length > 0 && !activeDeroule) {
      console.log('🔵 Initialisation du premier déroulé:', derouler[0])
      setActiveDeroule(derouler[0])
    }
  }, [derouler, activeDeroule])

  // Gestion des erreurs améliorée
  const handleError = useCallback(
    (err: any, context: string) => {
      console.error(`🔴 Erreur ${context}:`, err)

      let errorInfo: ErrorState

      if (err?.response) {
        const status = err.response.status
        switch (status) {
          case 404:
            errorInfo = {
              message: 'Déroulé non trouvé',
              type: 'data',
              details: "Ce déroulé n'existe plus ou a été supprimé",
            }
            break
          case 403:
            errorInfo = {
              message: 'Accès refusé',
              type: 'server',
              details: "Vous n'avez pas les permissions pour voir ce déroulé",
            }
            break
          case 500:
            errorInfo = {
              message: 'Erreur serveur',
              type: 'server',
              details: 'Problème temporaire du serveur',
            }
            break
          default:
            errorInfo = {
              message: 'Erreur du serveur',
              type: 'server',
              details: `Code d'erreur: ${status}`,
            }
        }
      } else if (err?.request) {
        errorInfo = {
          message: 'Problème de connexion',
          type: 'network',
          details: 'Vérifiez votre connexion internet',
        }
      } else {
        errorInfo = {
          message: 'Erreur inattendue',
          type: 'server',
          details: err.message || "Une erreur inconnue s'est produite",
        }
      }

      setError(errorInfo)

      // Affichage d'une alerte pour les erreurs critiques
      if (errorInfo.type === 'server' || errorInfo.type === 'data') {
        Alert.alert(errorInfo.message, errorInfo.details, [
          {
            text: 'Réessayer',
            onPress: () => {
              if (activeDeroule?.id) {
                setLoading(true)
                getDerouler({ id_deroule: activeDeroule.id })
                  .then((response) => {
                    if (response?.data) {
                      setDeroulerData(response.data)
                      setError(null)
                    }
                  })
                  .catch(console.error)
                  .finally(() => setLoading(false))
              }
            },
          },
          { text: 'Annuler', style: 'cancel' },
        ])
      }
    },
    [activeDeroule?.id, getDerouler],
  )

  // Récupération des données optimisée
  const fetchDeroulerData = useCallback(async () => {
    if (!activeDeroule?.id) {
      console.warn('⚠️ Aucun déroulé actif pour la récupération des données')
      return
    }

    console.log(
      '🔵 Récupération des données pour le déroulé:',
      activeDeroule.id,
    )
    setLoading(true)
    setError(null)

    try {
      const response = await getDerouler({ id_deroule: activeDeroule.id })

      if (response?.data) {
        //  console.log('🟢 Données récupérées avec succès:', response.data)
        setDeroulerData(response.data)
        setError(null)
      } else {
        throw new Error('Aucune donnée reçue du serveur')
      }
    } catch (err) {
      console.error(`🔴 Erreur récupération des données du déroulé:`, err)

      let errorMessage = 'Erreur lors du chargement'
      if (err?.response?.status === 404) {
        errorMessage = 'Déroulé non trouvé'
      } else if (err?.response?.status === 403) {
        errorMessage = 'Accès refusé'
      } else if (err?.request) {
        errorMessage = 'Problème de connexion'
      }

      setError({
        message: errorMessage,
        type: 'server',
        details: 'Impossible de charger les données du déroulé',
      })
    } finally {
      setLoading(false)
    }
  }, [activeDeroule?.id, getDerouler])

  // Changement de déroulé actif
  const handleDerouleChange = useCallback((deroule: Deroule) => {
    console.log('🔵 Changement de déroulé actif:', deroule.titre_deroule)
    setActiveDeroule(deroule)
    setDeroulerData(null)
    setError(null)
  }, [])

  // Rafraîchissement des données
  const handleRefresh = useCallback(() => {
    console.log('🔄 Rafraîchissement des données')
    setRefreshKey((prev) => prev + 1)

    if (activeDeroule?.id) {
      // setLoading(true)
      setError(null)
      getDerouler({ id_deroule: activeDeroule.id })
        .then((response) => {
          if (response?.data) {
            setDeroulerData(response.data)
            setError(null)
          }
        })
        .catch((err) => {
          console.error('🔴 Erreur rafraîchissement:', err)
          setError({
            message: 'Erreur de rafraîchissement',
            type: 'server',
            details: 'Impossible de rafraîchir les données',
          })
        })
        .finally(() => setLoading(false))
    }
  }, [activeDeroule?.id, getDerouler])

  // Chargement des données quand le déroulé actif change
  useEffect(() => {
    if (activeDeroule?.id) {
      fetchDeroulerData()
    }
  }, [activeDeroule?.id])

  // Rendu du message d'erreur avec responsive
  const renderError = useCallback(() => {
    if (!error) return null

    const errorColors = {
      network: colors.info || '#007AFF',
      server: colors.danger || '#FF3B30',
      data: colors.warning || '#FFA500',
    }

    return (
      <View
        style={[
          styles.errorContainer,
          { paddingHorizontal: getContainerPadding() },
        ]}
      >
        <Text
          style={[
            styles.errorTitle,
            {
              color: errorColors[error.type],
              fontSize: getFontSize(18),
              marginBottom: getResponsiveSpacing(10),
            },
          ]}
        >
          {error.message}
        </Text>
        {error.details && (
          <Text
            style={[
              styles.errorDetails,
              {
                fontSize: getFontSize(14),
                marginBottom: getResponsiveSpacing(20),
                lineHeight: getFontSize(20),
              },
            ]}
          >
            {error.details}
          </Text>
        )}
        <Button
          gradient={gradients.primary}
          style={[
            styles.retryButton,
            {
              paddingHorizontal: getResponsivePadding(30),
              paddingVertical: getResponsivePadding(12),
            },
          ]}
          onPress={handleRefresh}
        >
          <Text style={[styles.retryButtonText, { fontSize: getFontSize(16) }]}>
            Réessayer
          </Text>
        </Button>
      </View>
    )
  }, [error, colors, gradients, handleRefresh])

  // Rendu d'un onglet de déroulé avec responsive
  const renderDerouleTab = useCallback(
    ({ item: deroule }: { item: Deroule }) => {
      const isActive = deroule.id === activeDeroule?.id
      const tabPadding = getTabPadding()

      return (
        <Button
          gradient={isActive ? gradients.primary : gradients.secondary}
          style={[
            styles.tab,
            {
              marginRight: getTabMargin(),
            },
          ]}
          onPress={() => handleDerouleChange(deroule)}
          disabled={loading}
        >
          <Text
            style={[
              styles.tabText,
              {
                fontSize: getFontSize(isActive ? 15 : 14),
              },
            ]}
          >
            {deroule.titre_deroule}
          </Text>
        </Button>
      )
    },
    [activeDeroule?.id, gradients, loading, handleDerouleChange],
  )

  // États de rendu
  const isEmpty = derouler.length === 0
  const isReady = !loading && !error && deroulerData && activeDeroule

  // Rendu d'état vide avec responsive
  if (isEmpty) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.emptyContainer,
            { paddingHorizontal: getContainerPadding() },
          ]}
        >
          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
                fontSize: getFontSize(20),
                marginBottom: getResponsiveSpacing(10),
              },
            ]}
          >
            Aucun déroulé disponible
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              {
                color: colors.gray,
                fontSize: getFontSize(16),
                marginBottom: getResponsiveSpacing(30),
                lineHeight: getFontSize(22),
              },
            ]}
          >
            Il n'y a pas encore de déroulé configuré pour cet événement.
          </Text>
          <Button
            gradient={gradients.primary}
            style={[
              styles.emptyButton,
              {
                paddingHorizontal: getResponsivePadding(40),
                paddingVertical: getResponsivePadding(15),
              },
              {
                flex: 1,
                maxHeight: getResponsiveHeight(10),
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text
              style={[styles.emptyButtonText, { fontSize: getFontSize(16) }]}
            >
              Retour
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <Block style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButton}>
            <Feather name="arrow-left" size={25} color="#303133" />
          </View>
          <Text style={styles.headerTitle}>PRESTATAIRE</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation par onglets avec responsive */}
      <View
        style={[
          styles.tabContainer,
          {
            paddingVertical: getResponsiveSpacing(12),
            marginTop: getResponsiveSpacing(-30),
          },
        ]}
      >
        <FlatList
          data={derouler}
          horizontal
          contentContainerStyle={[
            styles.tabScrollContainer,
            { paddingHorizontal: getContainerPadding() },
          ]}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => `deroule-${item.id}`}
          renderItem={renderDerouleTab}
          extraData={activeDeroule?.id}
        />
      </View>

      {/* Contenu principal */}
      <View style={styles.contentContainer}>
        {loading && (
          <View
            style={[
              styles.loadingContainer,
              { paddingVertical: getResponsiveSpacing(50) },
            ]}
          >
            <ActivityIndicator
              size={isSmallScreen ? 'large' : 'large'}
              color={colors.primary}
            />
            <Text
              style={[
                styles.loadingText,
                {
                  color: colors.text,
                  marginTop: getResponsiveSpacing(15),
                  fontSize: getFontSize(16),
                },
              ]}
            >
              Chargement des données...
            </Text>
          </View>
        )}

        {error && renderError()}

        {isReady && (
          <ClientPrestaCard
            key={`${activeDeroule.id}-${refreshKey}`}
            activeDerouler={activeDeroule}
            eventData={{
              id_evt: item.idevt,
              id_client: item.clt_id,
            }}
            deroulerData={deroulerData}
            refreshData={handleRefresh}
          />
        )}
      </View>
    </Block>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: getResponsiveSpacing(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 17,
    marginTop: 20,
    gap: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    width: '90%',
    fontWeight: '600',
    color: '#000',
  },
  moreButton: {
    padding: 4,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabScrollContainer: {
    // Padding dynamique appliqué via style inline
  },
  tab: {
    // Styles dynamiques appliqués via style inline
  },
  tabText: {
    color: '#fff',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorDetails: {
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    // Padding dynamique appliqué via style inline
  },
  retryButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  emptyButton: {
    // Padding dynamique appliqué via style inline
  },
  emptyButtonText: {
    color: '#fff',
  },
})

export default ClientPresta
