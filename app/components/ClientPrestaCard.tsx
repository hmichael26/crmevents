import React, { useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ImageBackground,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'

interface VenueCardProps {
  activeDerouler: any
}

const ClientPrestaCard: React.FC<VenueCardProps> = ({ activeDerouler }) => {
  const { colors, sizes } = useTheme()
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
      renderItem={clientPrestaCardRenderItem}
      showsVerticalScrollIndicator={true}
      keyExtractor={(item, index) => index.toString()}
      style={{ paddingVertical: sizes.padding }}
      contentContainerStyle={{ paddingBottom: sizes.l }}
    />
  )
}

const clientPrestaCardRenderItem = ({ item }) => (
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
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{item.budget} eur</Text>
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>📍 {item.location}</Text>
        </View>
      </ImageBackground>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>👎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>👍</Text>
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.sideButtons}>
      <TouchableOpacity style={styles.sideButton}>
        <Text style={styles.sideButtonText}>Brochure</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sideButton}>
        <Text style={styles.sideButtonText}>Photos</Text>
      </TouchableOpacity>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <TouchableOpacity key={index} style={styles.sideButton}>
          <Text style={styles.sideButtonText}>Devis</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)

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
  },
  cardContent: {
    flex: 1,
  },
  venueNameContainer: {
    backgroundColor: '#8CD867',
    padding: 4,

    marginVertical: 6,

    justifyContent: 'center',
    alignItems: 'center',
  },
  venueName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  venueImage: {
    width: '100%',

    flex: 1,
    flexDirection: 'column',

    alignItems: 'center',
  },
  priceTag: {
    backgroundColor: '#4ECCE6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 15,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  locationContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 10,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  actionButton: {
    padding: 4,
  },
  actionButtonText: {
    fontSize: 20,
  },
  sideButtons: {
    width: 100,
    backgroundColor: '#f0f0f0',
  },
  sideButton: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#A9A9A9',
    marginVertical: 1,
  },
  sideButtonText: {
    color: '#fff',
    fontSize: 12,
  },
})

export default ClientPrestaCard
