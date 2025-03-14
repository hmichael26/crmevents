import React, { useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ImageBackground,
  Linking,
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

const ClientPrestaCard: React.FC<VenueCardProps> = ({ activeDerouler }) => {
  const { colors, sizes, gradients } = useTheme()
  const { getDerouler } = useApi()
  const [data0, setData0] = React.useState([])
  const PrestaInterroger = data0?.all_presta_interroges || []

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
      <View>
        <Text
          style={{ color: colors.danger, fontSize: 20, textAlign: 'center' }}
        >
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
      <View>
        <Text
          style={{ color: colors.danger, fontSize: 20, textAlign: 'center' }}
        >
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

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <ImageBackground
          source={{ uri: item.lien_brochure }}
          style={styles.venueImage}
          resizeMode="cover"
        >
          <View style={styles.venueNameContainer}>
            <Text style={styles.venueName}>{item.nom_presta}</Text>
          </View>
          {item.budget && (
            <Button
              gradient={GRADIENTS.info}
              style={styles.priceTag}
              width={70}
            >
              <Text style={styles.priceText}>{item.budget} €</Text>
            </Button>
          )}

          {/* Localisation cliquable */}
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => openGoogleMaps(item.ggmap, item.location)}
          >
            <Text style={styles.locationText}>📍 {item.ville}</Text>
          </TouchableOpacity>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="like2" style={styles.actionButtonText}></Icon>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="dislike2" style={styles.actionButtonText}></Icon>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.sideButtons}>
        {/* Calculer le nombre total de boutons */}
        {(() => {
          const totalButtons = 2 + (item?.all_devis?.length || 0) // Brochure + Photos + Devis
          const buttonFlex = 1 / totalButtons // Distribuer l'espace équitablement

          return (
            <View style={{ flex: 1, gap: 2 }}>
              <Button
                style={[styles.sideButton]}
                flex={0}
                gradient={GRADIENTS.secondary}
              >
                <Text style={styles.sideButtonText}>Brochure</Text>
              </Button>
              <Button
                style={[styles.sideButton]}
                flex={0}
                gradient={GRADIENTS.secondary}
              >
                <Text style={styles.sideButtonText}>Photos</Text>
              </Button>
              {item?.all_devis.map(
                (_: any, index: React.Key | null | undefined) =>
                  index <= 3 && (
                    <Button
                      key={index}
                      gradient={GRADIENTS.secondary}
                      flex={0}
                      style={styles.sideButton}
                    >
                      <Text style={styles.sideButtonText}>Devis </Text>
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
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 200, // Définir une hauteur minimale pour la carte
  },
  cardContent: {
    flex: 1,
  },
  venueNameContainer: {
    backgroundColor: '#8CD867',
    padding: 6,
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  venueImage: {
    width: 270,
    height: 270,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 10,
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
    fontSize: 17,
  },
  locationContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 20,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
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
    fontSize: 22,
    color: '#fff',
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
    fontSize: 15,
  },
})

export default ClientPrestaCard
