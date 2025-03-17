import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ImageBackground,
  Linking,
  Dimensions,
  useWindowDimensions,
  Platform,
  PixelRatio,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'
import Button from './Button'
import { GRADIENTS } from '../constants/light'
import Icon from 'react-native-vector-icons/AntDesign'

interface VenueCardProps {
  activeDerouler: any
}

// Function to normalize font sizes across different screen sizes
const normalize = (size: number) => {
  const { width, height } = Dimensions.get('window')
  const scale = width / 320 // base width
  const newSize = size * scale

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}

const ClientPrestaCard: React.FC<VenueCardProps> = ({ activeDerouler }) => {
  const { colors, sizes, gradients } = useTheme()
  const { getDerouler } = useApi()
  const [data0, setData0] = React.useState([])
  const PrestaInterroger = data0?.all_presta_interroges || []
  const dimensions = useWindowDimensions()
  const isSmallDevice = dimensions.width < 375

  const getDerouleData0 = async () => {
    try {
      const response = await getDerouler({ id_deroule: activeDerouler.id })
      setData0(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error)
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les données du déroulé. Veuillez réessayer.',
      )
    }
  }

  useEffect(() => {
    if (activeDerouler?.id) {
      getDerouleData0()
    }
  }, [activeDerouler])

  if (!activeDerouler) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: colors.danger }]}>
          chargement ...
        </Text>
      </View>
    )
  }

  if (
    !data0.all_presta_interroges ||
    data0.all_presta_interroges.length === 0
  ) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: colors.danger }]}>
          Aucun prestataire associé à ce deroule
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={PrestaInterroger}
      renderItem={({ item }) => <ClientPrestaCardRenderItem item={item} />}
      showsVerticalScrollIndicator={true}
      keyExtractor={(item, index) => index.toString()}
      style={{ paddingVertical: sizes.padding }}
      contentContainerStyle={{ paddingBottom: sizes.l }}
    />
  )
}

const ClientPrestaCardRenderItem = ({ item }) => {
  console.log(item)
  const dimensions = useWindowDimensions()
  const isLandscape = dimensions.width > dimensions.height
  const isSmallDevice = dimensions.width < 375

  const openGoogleMaps = (ggmap, location) => {
    const url = ggmap
      ? ggmap
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location,
        )}`
    Linking.openURL(url).catch((err) =>
      console.error("Impossible d'ouvrir Google Maps", err),
    )
  }

  // Adjust layout based on orientation and screen size
  const cardStyles = [
    styles.card,
    isLandscape && { flexDirection: 'row' },
    !isLandscape && { flexDirection: isSmallDevice ? 'column' : 'row' },
  ]

  const imageWidth = isLandscape
    ? dimensions.width * 0.6
    : isSmallDevice
    ? dimensions.width - 32
    : dimensions.width * 0.6

  return (
    <View style={cardStyles}>
      <View
        style={[
          styles.cardContent,
          !isLandscape && isSmallDevice && { width: '100%' },
        ]}
      >
        <ImageBackground
          source={{ uri: item.lien_brochure }}
          style={[
            styles.venueImage,
            {
              width: imageWidth,
              height: isLandscape ? dimensions.height * 0.8 : 270,
            },
          ]}
          resizeMode="cover"
        >
          <View style={styles.venueNameContainer}>
            <Button
              style={[styles.venueName, { paddingHorizontal: 10 }]}
              gradient={GRADIENTS.success}
            >
              <Text
                style={[
                  styles.venueName,
                  isSmallDevice && { fontSize: normalize(14) },
                ]}
              >
                {item.nom_presta}
              </Text>
            </Button>
          </View>
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

          {/* Localisation cliquable */}
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
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon
                name="like2"
                style={[
                  styles.actionButtonText,
                  isSmallDevice && { fontSize: normalize(20) },
                ]}
              ></Icon>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon
                name="dislike2"
                style={[
                  styles.actionButtonText,
                  isSmallDevice && { fontSize: normalize(20) },
                ]}
              ></Icon>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

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
        {(() => {
          const totalButtons = 2 + (item?.all_devis?.length || 0) // Brochure + Photos + Devis
          const isHorizontalLayout = !isLandscape && isSmallDevice

          return (
            <View
              style={{
                flex: 1,
                gap: 2,
                flexDirection: isHorizontalLayout ? 'row' : 'column',
                justifyContent: isHorizontalLayout
                  ? 'space-between'
                  : 'flex-start',
              }}
            >
              <Button
                style={[
                  styles.sideButton,
                  isHorizontalLayout && { flex: 1, marginHorizontal: 1 },
                ]}
                flex={0}
                gradient={GRADIENTS.secondary}
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
              <Button
                style={[
                  styles.sideButton,
                  isHorizontalLayout && { flex: 1, marginHorizontal: 1 },
                ]}
                flex={0}
                gradient={GRADIENTS.secondary}
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
              {item?.all_devis.map(
                (_: any, index: React.Key | null | undefined) =>
                  index <= (isHorizontalLayout ? 1 : 3) && (
                    <Button
                      key={index}
                      gradient={GRADIENTS.secondary}
                      flex={0}
                      style={[
                        styles.sideButton,
                        isHorizontalLayout && { flex: 1, marginHorizontal: 1 },
                      ]}
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
        })()}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: normalize(20),
    textAlign: 'center',
  },
  errorText: {
    fontSize: normalize(20),
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 200,
    // flexDirection is set dynamically
  },
  cardContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  venueNameContainer: {
    marginVertical: 16,

    height: 40,
  },
  venueName: {
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 20,
  },
  venueImage: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    // width and height are set dynamically
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
  },
  actionButton: {
    padding: 4,
  },
  actionButtonText: {
    fontSize: normalize(22),
    color: '#fff',
  },
  sideButtons: {
    flex: 0.53,
    width: 120, // Width is adjusted dynamically
    flexDirection: 'column', // Direction is adjusted dynamically
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
})

export default ClientPrestaCard
