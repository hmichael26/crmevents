import React, { useState, useCallback, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ImageBackground,
  Dimensions,
  useWindowDimensions,
  Platform,
  PixelRatio,
  Linking,
  Modal,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'
import Button from './Button'
import { GRADIENTS } from '../constants/light'
import Icon from 'react-native-vector-icons/AntDesign'
import { ArrowUpCircle, ThumbsDown, ThumbsUp } from 'react-native-feather'
import logo from '../assets/images/splash.png'
import VoteButtons from './VoteButtons'

// Constants
const { width, height } = Dimensions.get('window')

// Types
interface VenueCardProps {
  activeDerouler: {
    id: number
    [key: string]: any
  }
  eventData: {
    id_evt: string | number
    id_client: string | number
  }
  deroulerData: any
  refreshData: () => Promise<void>
}

interface PrestaItem {
  id_presta: number
  nom_presta: string
  budget?: string
  location?: string
  ggmap?: string
  lien_brochure?: string
  pouce_leve?: number
  pouce_baisse?: number
  all_imgs?: Array<{ image: string }>
  all_devis?: Array<{ lien_devis: string }>
}

interface ErrorState {
  message: string
  type: 'network' | 'server' | 'validation'
}

// Utility functions memoized
const normalize = (size: number): number => {
  const { width } = Dimensions.get('window')
  const scale = width / 320
  const newSize = size * scale

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}

const openUrl = async (url: string | undefined): Promise<void> => {
  if (!url?.trim()) {
    Alert.alert('Erreur', 'Aucun lien disponible')
    return
  }

  try {
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
    } else {
      throw new Error('URL non supportée')
    }
  } catch (error) {
    console.error('🔴 Erreur ouverture URL:', error)
    Alert.alert('Erreur', "Impossible d'ouvrir ce lien.")
  }
}

const openGoogleMaps = (ggmap?: string, location?: string): void => {
  const url =
    ggmap ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location || '',
    )}`
  openUrl(url)
}

// Main component
const ClientPrestaCard: React.FC<VenueCardProps> = ({
  activeDerouler,
  eventData,
  deroulerData,
  refreshData,
}) => {
  const { colors, sizes } = useTheme()
  const [error, setError] = useState<ErrorState | null>(null)

  // Memoized prestataires list avec validation
  const prestaInterroger = useMemo(() => {
    const presta = deroulerData?.all_presta_interroges || []
    if (!Array.isArray(presta)) {
      console.warn("⚠️ all_presta_interroges n'est pas un tableau")
      return []
    }
    return presta.filter(
      (item: any) => item && item.id_presta && item.nom_presta,
    )
  }, [deroulerData?.all_presta_interroges])

  // Loading state
  if (!activeDerouler) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.statusText, { color: colors.text }]}>
          Chargement...
        </Text>
      </View>
    )
  }

  // Empty state
  if (!prestaInterroger.length) {
    return (
      <View style={styles.container}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Aucun prestataire disponible
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.gray }]}>
          Il n'y a pas encore de prestataire associé à ce déroulé.
        </Text>
      </View>
    )
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorTitle, { color: colors.danger }]}>
          {error.message}
        </Text>
        <Button
          gradient={GRADIENTS.primary}
          style={styles.retryButton}
          onPress={() => {
            setError(null)
            refreshData()
          }}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </Button>
      </View>
    )
  }

  return (
    <FlatList
      data={prestaInterroger}
      renderItem={({ item, index }) => (
        <PrestaCardItem
          key={`presta-${index}`}
          item={item}
          refreshData={refreshData}
          derouleId={activeDerouler.id}
          eventData={eventData}
          onError={setError}
        />
      )}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => `presta-${item.id_presta}`}
      style={{ paddingVertical: sizes.padding }}
      contentContainerStyle={{ paddingBottom: sizes.l }}
      removeClippedSubviews={true} // Optimisation performance
      maxToRenderPerBatch={5} // Optimisation performance
      windowSize={10} // Optimisation performance
      nestedScrollEnabled={true} // Permet les scrolls imbriqués
      keyboardShouldPersistTaps="handled" // Gère les interactions pendant le scroll
      scrollEventThrottle={16} // Optimise les événements de scroll
    />
  )
}

// Card item component
interface PrestaCardItemProps {
  item: PrestaItem
  refreshData: () => Promise<void>
  derouleId: number
  eventData: {
    id_evt: string | number
    id_client: string | number
  }
  onError: (error: ErrorState) => void
}

const PrestaCardItem: React.FC<PrestaCardItemProps> = React.memo(
  ({ item, refreshData, derouleId, eventData, onError }) => {
    const { sendPouce } = useApi()
    const dimensions = useWindowDimensions()

    // States
    const [photos, setPhotos] = useState<Array<{ image: string }>>([])
    const [modalImageVisible, setModalImageVisible] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isVoting, setIsVoting] = useState(false)

    // Memoized calculations
    const { isLandscape, isSmallDevice, imageWidth } = useMemo(() => {
      const isLandscape = dimensions.width > dimensions.height
      const isSmallDevice = dimensions.width < 375
      const imageWidth = isLandscape
        ? dimensions.width * 0.6
        : isSmallDevice
        ? dimensions.width - 32
        : dimensions.width * 0.6

      return { isLandscape, isSmallDevice, imageWidth }
    }, [dimensions.width, dimensions.height])

    // Optimized vote handler
    const handleSendPouce = useCallback(
      async (pouceLeve: number, pouceBaisse: number) => {
        if (isVoting) return // Prévenir les double-clics

        console.log('🔵 Envoi du vote:', {
          pouceLeve,
          pouceBaisse,
          presta: item.nom_presta,
        })
        setIsVoting(true)

        try {
          const response = await sendPouce({
            ...eventData,
            id_deroule: derouleId,
            id_presta: item.id_presta,
            pouce_leve: pouceLeve,
            pouce_baisse: pouceBaisse,
          })

          if (response.code === 'SUCCESS') {
            console.log('🟢 Vote envoyé avec succès')
          } else {
            throw new Error(response.message || 'Erreur lors du vote')
          }
        } catch (error) {
          console.error('🔴 Erreur envoi vote:', error)

          const errorMessage =
            error?.response?.status === 403
              ? "Vous n'avez pas les permissions pour voter"
              : error?.request
              ? 'Problème de connexion'
              : 'Erreur lors du vote'

          onError({
            message: errorMessage,
            type: error?.request ? 'network' : 'server',
          })
        } finally {
          setIsVoting(false)
        }
      },
      [
        isVoting,
        eventData,
        derouleId,
        item.id_presta,
        item.nom_presta,
        sendPouce,
        refreshData,
        onError,
      ],
    )

    const handleOpenWebsite = (link) => {
      Linking.openURL(link)
    }

    // Modal handlers
    const openModalWithImages = useCallback(
      (images?: Array<{ image: string }>) => {
        if (images?.length > 0) {
          console.log('🔵 Ouverture galerie photos:', images.length, 'images')
          setPhotos(images)
          setCurrentImageIndex(0)
          setModalImageVisible(true)
        } else {
          Alert.alert('Information', 'Aucune photo disponible.')
        }
      },
      [],
    )

    const navigateImages = useCallback(
      (direction: 'prev' | 'next') => {
        setCurrentImageIndex((prev) => {
          if (direction === 'prev') {
            return prev > 0 ? prev - 1 : prev
          } else {
            return prev < photos.length - 1 ? prev + 1 : prev
          }
        })
      },
      [photos.length],
    )

    const closeModal = useCallback(() => {
      setModalImageVisible(false)
      setPhotos([])
      setCurrentImageIndex(0)
    }, [])

    // Document handlers
    const openDocument = useCallback(() => {
      console.log('🔵 Ouverture brochure:', item.lien_brochure)
      openUrl(item.lien_brochure)
    }, [item.lien_brochure])

    const openPhotos = useCallback(() => {
      openModalWithImages(item.all_imgs)
    }, [item.all_imgs, openModalWithImages])

    const openLocation = useCallback(() => {
      console.log('🔵 Ouverture localisation:', item.location)
      openGoogleMaps(item.ggmap, item.location)
    }, [item.ggmap, item.location])

    // Vote success handler
    const handleVoteSuccess = useCallback(() => {
      console.log('🟢 Vote réussi, actualisation des données')
    }, [refreshData])

    // Vote error handler
    const handleVoteError = useCallback((errorMessage: string) => {
      console.error('🔴 Erreur vote:', errorMessage)
    }, [])
    return (
      <View style={[styles.card, { flexDirection: 'row' }]}>
        {/* Main card content with image */}
        <View
          style={[
            styles.cardContent,
            !isLandscape && isSmallDevice && { width: '100%' },
          ]}
        >
          <ImageBackground
            source={
              item?.lien_brochure &&
              item.lien_brochure !== 'https://www.goseminaire.com/crm/upload/'
                ? { uri: item.lien_brochure }
                : item?.all_imgs?.length > 0
                ? { uri: item.all_imgs[0].image }
                : logo
            }
            style={[
              styles.venueImage,
              { width: imageWidth, height: imageWidth },
            ]}
            imageStyle={{
              borderRadius: 10,
              backgroundColor: '#f0f0f0',
            }}
            resizeMode="cover"
          >
            {/* Venue name */}
            <View style={styles.venueNameContainer}>
              <Button
                flex={1}
                style={[styles.venueName, { paddingHorizontal: 0 }]}
                gradient={GRADIENTS.success}
                onPress={() => handleOpenWebsite(item.site_internet)}
              >
                <Text
                  style={[
                    styles.venueNameText,
                    isSmallDevice && { fontSize: normalize(11) },
                  ]}
                  numberOfLines={2}
                >
                  {item.nom_presta}
                </Text>
              </Button>
            </View>

            {/* Budget price tag */}
            {item.budget && (
              <Button
                gradient={GRADIENTS.info}
                style={[styles.priceTag, isSmallDevice && { width: 60 }]}
                width={isSmallDevice ? 60 : 150}
              >
                <Text
                  style={[
                    styles.priceText,
                    isSmallDevice && { fontSize: normalize(15) },
                  ]}
                  numberOfLines={1}
                >
                  {item.budget} €
                </Text>
              </Button>
            )}

            {/* Location button */}
            {item.location && (
              <TouchableOpacity
                style={styles.locationContainer}
                onPress={openLocation}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.locationText,
                    isSmallDevice && { fontSize: normalize(10) },
                  ]}
                  numberOfLines={2}
                >
                  📍 {item.location}
                </Text>
              </TouchableOpacity>
            )}

            {/* Like/Dislike buttons */}
            {/* Vote Buttons Component */}
            <VoteButtons
              item={item}
              eventData={eventData}
              derouleId={derouleId}
              onVoteSuccess={handleVoteSuccess}
              onVoteError={handleVoteError}
            />
          </ImageBackground>
        </View>

        {/* Side buttons */}
        <View
          style={[
            styles.sideButtons,
            !isLandscape &&
              isSmallDevice && {
                width: '100%',
                height: 50,
                flexDirection: 'row',
                maxHeight: 50,
              },
            isLandscape && {
              width: dimensions.width * 0.25,
              maxHeight: imageWidth,
            },
          ]}
        >
          <SideButtonsSection
            item={item}
            isHorizontalLayout={!isLandscape && isSmallDevice}
            isSmallDevice={isSmallDevice}
            openDocument={openDocument}
            openPhotos={openPhotos}
          />
        </View>

        {/* Image gallery modal */}
        <ImageGalleryModal
          visible={modalImageVisible}
          photos={photos}
          currentIndex={currentImageIndex}
          onClose={closeModal}
          onPrevious={() => navigateImages('prev')}
          onNext={() => navigateImages('next')}
        />
      </View>
    )
  },
)

// Side buttons component
interface SideButtonsSectionProps {
  item: PrestaItem
  isHorizontalLayout: boolean
  isSmallDevice: boolean
  openDocument: () => void
  openPhotos: () => void
}

const SideButtonsSection: React.FC<SideButtonsSectionProps> = React.memo(
  ({ item, isHorizontalLayout, isSmallDevice, openDocument, openPhotos }) => {
    const devisButtons = useMemo(() => {
      return (item?.all_devis || [])
        .slice(0, 100) // Max 100 devis
        .map((devis, index) => (
          <Button
            key={`devis-${index}`}
            gradient={GRADIENTS.secondary}
            style={[
              styles.sideButton,
              isHorizontalLayout && { flex: 1, marginHorizontal: 1 },
            ]}
            width={110}
            onPress={() => openUrl(devis?.lien_devis)}
          >
            <Text
              style={[
                styles.sideButtonText,
                isSmallDevice && { fontSize: normalize(13) },
              ]}
            >
              Devis {index + 1}
            </Text>
          </Button>
        ))
    }, [item?.all_devis, isHorizontalLayout, isSmallDevice])

    // Si c'est un layout horizontal (petit écran), pas de scroll vertical
    if (isHorizontalLayout) {
      return (
        <View
          style={{
            gap: 2,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {/* Brochure button */}
          <Button
            style={[styles.sideButton, { flex: 1, marginHorizontal: 1 }]}
            gradient={GRADIENTS.secondary}
            width={110}
            onPress={openDocument}
          >
            <Text
              style={[
                styles.sideButtonText,
                isSmallDevice && { fontSize: normalize(13) },
              ]}
            >
              Brochure
            </Text>
          </Button>

          {/* Photos button */}
          <Button
            style={[styles.sideButton, { flex: 1, marginHorizontal: 1 }]}
            width={110}
            gradient={GRADIENTS.secondary}
            onPress={openPhotos}
          >
            <Text
              style={[
                styles.sideButtonText,
                isSmallDevice && { fontSize: normalize(13) },
              ]}
            >
              Photos ({item?.all_imgs?.length || 0})
            </Text>
          </Button>

          {/* Premier devis seulement en mode horizontal */}
          {devisButtons[0]}
        </View>
      )
    }

    // Layout vertical avec ScrollView pour tous les boutons
    return (
      <ScrollView
        style={styles.sideButtonsScrollView}
        contentContainerStyle={styles.sideButtonsContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        scrollIndicatorInsets={{ right: 1 }}
        nestedScrollEnabled={true} // Permet le scroll imbriqué sur Android
        scrollEnabled={true} // Force l'activation du scroll
        bounces={false} // Désactive le bounce pour éviter les conflits
        overScrollMode="never" // Android: évite les effets de sur-scroll
        keyboardShouldPersistTaps="handled" // Gère les taps pendant le scroll
        onScrollBeginDrag={() => {
          // Optionnel: logique pour gérer le début du scroll
        }}
        onScrollEndDrag={() => {
          // Optionnel: logique pour gérer la fin du scroll
        }}
      >
        {/* Brochure button */}
        <Button
          style={styles.sideButton}
          gradient={GRADIENTS.secondary}
          width={110}
          onPress={openDocument}
        >
          <Text
            style={[
              styles.sideButtonText,
              isSmallDevice && { fontSize: normalize(13) },
            ]}
          >
            Brochure
          </Text>
        </Button>

        {/* Photos button */}
        <Button
          style={styles.sideButton}
          width={110}
          gradient={GRADIENTS.secondary}
          onPress={openPhotos}
        >
          <Text
            style={[
              styles.sideButtonText,
              isSmallDevice && { fontSize: normalize(13) },
            ]}
          >
            Photos ({item?.all_imgs?.length || 0})
          </Text>
        </Button>

        <View style={{ marginBottom: 25 }}>{devisButtons}</View>
      </ScrollView>
    )
  },
)

// Image gallery modal component
interface ImageGalleryModalProps {
  visible: boolean
  photos: Array<{ image: string }>
  currentIndex: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = React.memo(
  ({ visible, photos, currentIndex, onClose, onPrevious, onNext }) => {
    const canNavigate = useMemo(
      () => ({
        prev: currentIndex > 0,
        next: currentIndex < photos.length - 1,
      }),
      [currentIndex, photos.length],
    )

    const currentPhoto = useMemo(() => photos?.[currentIndex]?.image, [
      photos,
      currentIndex,
    ])

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay} />

        <View style={styles.modalContainer}>
          {currentPhoto ? (
            <Image
              source={{ uri: currentPhoto }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imageError}>
              <Text style={styles.modalText}>Image indisponible</Text>
            </View>
          )}

          {/* Image counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.modalText}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={onPrevious}
              style={[
                styles.navButton,
                !canNavigate.prev && styles.navButtonDisabled,
              ]}
              disabled={!canNavigate.prev}
              activeOpacity={0.7}
            >
              <Text style={styles.modalText}>← Précédent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onNext}
              style={[
                styles.navButton,
                !canNavigate.next && styles.navButtonDisabled,
              ]}
              disabled={!canNavigate.next}
              activeOpacity={0.7}
            >
              <Text style={styles.modalText}>Suivant →</Text>
            </TouchableOpacity>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.modalText}>✕ Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  },
)

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  statusText: {
    fontSize: normalize(16),
    textAlign: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: normalize(14),
    textAlign: 'center',
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'center',
    gap: 6,
  },
  cardContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  venueImage: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  venueNameContainer: {
    marginVertical: 10,
    height: 60,
    width: '95%',
    paddingHorizontal: 3,
  },
  venueNameText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: normalize(11),
  },
  venueName: {
    borderRadius: 20,
  },
  priceTag: {
    backgroundColor: '#4ECCE6',
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 15,
  },
  priceText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: normalize(17),
  },
  locationContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 20,
    maxWidth: '80%',
  },
  locationText: {
    color: '#fff',
    fontSize: normalize(12),
    textAlign: 'center',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: normalize(22),
    color: '#140101BD',
  },
  activeVote: {
    color: '#fff',
  },
  sideButtons: {
    width: 120,
    flexDirection: 'column',
    backgroundColor: '#fff',
    maxHeight: 400, // Ajoutez une hauteur max pour forcer le scroll
    overflow: 'scroll', // Empêche le scroll si le contenu est trop grand
  },
  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A9A9A9',
    marginVertical: 0.2,
    height: 40,
    minHeight: 40,
  },
  sideButtonText: {
    color: '#fff',
    fontSize: normalize(14),
    textAlign: 'center',
  },
  modalOverlay: {
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
  imageError: {
    width: width * 0.9,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  imageCounter: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 100,
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sideButtonsScrollView: {
    flex: 1,
    width: '100%',
    maxHeight: '100%',
    overflow: 'scroll',
  },
  sideButtonsContent: {
    gap: 2,
    paddingVertical: 4,
    flexGrow: 1,
    paddingBottom: 90,
  },
  // Modifiez aussi le style sideButtons existant
})

export default ClientPrestaCard
