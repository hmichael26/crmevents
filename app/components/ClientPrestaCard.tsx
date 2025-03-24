import React, { useState } from 'react'
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
} from 'react-native'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'
import Button from './Button'
import { GRADIENTS } from '../constants/light'
import Icon from 'react-native-vector-icons/AntDesign'

// Constants
const { width, height } = Dimensions.get('window')

// Types
interface VenueCardProps {
  activeDerouler: {
    id: number
    [key: string]: any
  }
  eventData: any
  deroulerData: any // Added prop to receive data from parent
  refreshData: () => Promise<void> // Added prop to receive refresh function
}

// Utility functions
const normalize = (size: number): number => {
  const { width } = Dimensions.get('window')
  const scale = width / 320 // base width
  const newSize = size * scale

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}

const openUrl = async (url: string | undefined): Promise<void> => {
  if (url) {
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error('Failed to open URL:', error)
      Alert.alert('Erreur', "Impossible d'ouvrir ce lien.")
    }
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
  deroulerData, // Use the data passed from parent
  refreshData, // Use the refresh function passed from parent
}) => {
  const { colors, sizes } = useTheme()

  // Now we're using the data passed from the parent component
  const prestaInterroger = deroulerData?.all_presta_interroges || []

  if (!activeDerouler) {
    return (
      <View style={styles.container}>
        <Text style={[styles.statusText, { color: colors.danger }]}>
          Chargement...
        </Text>
      </View>
    )
  }

  if (!prestaInterroger.length) {
    return (
      <View style={styles.container}>
        <Text style={[styles.statusText, { color: colors.danger }]}>
          Aucun prestataire associé à ce déroulé
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={prestaInterroger}
      renderItem={({ item }) => (
        <PrestaCardItem
          item={item}
          refreshData={refreshData} // Passing the parent's refresh function
          derouleId={activeDerouler.id}
          eventData={eventData}
        />
      )}
      showsVerticalScrollIndicator={true}
      keyExtractor={(_, index) => index.toString()}
      style={{ paddingVertical: sizes.padding }}
      contentContainerStyle={{ paddingBottom: sizes.l }}
    />
  )
}

// Card item component
interface PrestaCardItemProps {
  item: any
  refreshData: () => Promise<void>
  derouleId: number
  eventData: any
}

const PrestaCardItem: React.FC<PrestaCardItemProps> = ({
  item,
  refreshData,
  derouleId,
  eventData,
}) => {
  const { sendPouce } = useApi()
  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height
  const isSmallDevice = dimensions.width < 375

  const [photos, setPhotos] = useState<Array<{ image: string }>>([])
  const [modalImageVisible, setModalImageVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const imageWidth = isLandscape
    ? dimensions.width * 0.6
    : isSmallDevice
    ? dimensions.width - 32
    : dimensions.width * 0.6

  const handleSendPouce = async (pouceLeve: number, pouceBaisse: number) => {
    try {
      const response = await sendPouce({
        ...eventData,
        id_deroule: derouleId,
        id_presta: item.id_presta,
        pouce_leve: pouceLeve,
        pouce_baisse: pouceBaisse,
      })

      if (response.code == 'SUCCESS') {
        // Call the refresh function passed from parent
        await refreshData()
      }
    } catch (error) {
      console.error('Error sending pouce:', error)
      Alert.alert(
        'Erreur',
        "Impossible d'envoyer votre vote. Veuillez réessayer.",
      )
    }
  }

  const openModalWithImages = (images?: Array<{ image: string }>) => {
    if (images && images.length > 0) {
      setPhotos(images)
      setCurrentImageIndex(0)
      setModalImageVisible(true)
    } else {
      Alert.alert('Information', 'Aucune photo disponible.')
    }
  }

  const navigateImages = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else {
      setCurrentImageIndex((prev) =>
        prev < photos.length - 1 ? prev + 1 : prev,
      )
    }
  }

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
          source={{ uri: item.lien_brochure }}
          style={[styles.venueImage, { width: imageWidth, height: imageWidth }]}
          imageStyle={{ borderRadius: 10, backgroundColor: '#f0f0f0' }}
          resizeMode="cover"
        >
          {/* Venue name */}
          <View style={styles.venueNameContainer}>
            <Button
              style={[styles.venueName, { paddingHorizontal: 10 }]}
              gradient={GRADIENTS.success}
            >
              <Text
                style={[
                  styles.venueNameText,
                  isSmallDevice && { fontSize: normalize(14) },
                ]}
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
              width={isSmallDevice ? 60 : 70}
            >
              <Text
                style={[
                  styles.priceText,
                  isSmallDevice && { fontSize: normalize(15) },
                ]}
              >
                {item.budget} €
              </Text>
            </Button>
          )}

          {/* Location button */}
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => openGoogleMaps(item.ggmap, item.location)}
          >
            <Text
              style={[
                styles.locationText,
                isSmallDevice && { fontSize: normalize(10) },
              ]}
            >
              📍 {item.location}
            </Text>
          </TouchableOpacity>

          {/* Like/Dislike buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSendPouce(1, 0)}
            >
              <Icon
                name="like2"
                style={[
                  styles.actionButtonText,
                  isSmallDevice && { fontSize: normalize(20) },
                  item?.pouce_leve == 1 && { color: '#fff' },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSendPouce(0, 1)}
            >
              <Icon
                name="dislike2"
                style={[
                  styles.actionButtonText,
                  isSmallDevice && { fontSize: normalize(20) },
                  item?.pouce_baisse == 1 && { color: '#fff' },
                ]}
              />
            </TouchableOpacity>
          </View>
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
            },
          isLandscape && { width: dimensions.width * 0.25 },
        ]}
      >
        <SideButtonsSection
          item={item}
          isHorizontalLayout={!isLandscape && isSmallDevice}
          isSmallDevice={isSmallDevice}
          openDocument={() => openUrl(item.lien_brochure)}
          openPhotos={() => openModalWithImages(item.all_imgs)}
        />
      </View>

      {/* Image gallery modal */}
      <ImageGalleryModal
        visible={modalImageVisible}
        photos={photos}
        currentIndex={currentImageIndex}
        onClose={() => setModalImageVisible(false)}
        onPrevious={() => navigateImages('prev')}
        onNext={() => navigateImages('next')}
      />
    </View>
  )
}

// Side buttons component
interface SideButtonsSectionProps {
  item: any
  isHorizontalLayout: boolean
  isSmallDevice: boolean
  openDocument: () => void
  openPhotos: () => void
}

const SideButtonsSection: React.FC<SideButtonsSectionProps> = ({
  item,
  isHorizontalLayout,
  isSmallDevice,
  openDocument,
  openPhotos,
}) => {
  return (
    <View
      style={{
        gap: 2,
        flexDirection: isHorizontalLayout ? 'row' : 'column',
        justifyContent: isHorizontalLayout ? 'space-between' : 'flex-start',
      }}
    >
      {/* Brochure button */}
      <Button
        style={[
          styles.sideButton,
          isHorizontalLayout && { flex: 1, marginHorizontal: 1 },
        ]}
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
        style={[
          styles.sideButton,
          isHorizontalLayout && { flex: 1, marginHorizontal: 1 },
        ]}
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
          Photos
        </Text>
      </Button>

      {/* Devis buttons (max 3) */}
      {(item?.all_devis || []).map(
        (devis, index) =>
          index <= 2 && (
            <Button
              key={index}
              gradient={GRADIENTS.secondary}
              flex={0}
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
                Devis
              </Text>
            </Button>
          ),
      )}
    </View>
  )
}

// Image gallery modal component
interface ImageGalleryModalProps {
  visible: boolean
  photos: Array<{ image: string }>
  currentIndex: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  visible,
  photos,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        ]}
      />

      <View style={styles.modalContainer}>
        {photos?.length > 0 && currentIndex < photos.length ? (
          <Image
            source={{ uri: photos[currentIndex].image }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.modalText}>Image indisponible</Text>
        )}

        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={onPrevious} style={styles.navButton}>
            <Text style={styles.modalText}>Précédent</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={styles.navButton}>
            <Text style={styles.modalText}>Suivant</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.modalText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statusText: {
    fontSize: normalize(20),
    textAlign: 'center',
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
    marginVertical: 16,
    height: 40,
  },
  venueNameText: {
    color: '#fff',
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
  },
  actionButton: {
    padding: 4,
  },
  actionButtonText: {
    fontSize: normalize(22),
    color: '#140101BD',
  },
  sideButtons: {
    width: 120,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A9A9A9',
    marginVertical: 0.2,
  },
  sideButtonText: {
    color: '#fff',
    fontSize: normalize(15),
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
  modalText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
})

export default ClientPrestaCard
