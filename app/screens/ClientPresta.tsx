import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ClientPrestaCard from '../components/ClientPrestaCard'
import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { useApi } from '../context/useApi'

interface Venue {
  id: string
  name: string
  price: string
  location: string
  image: string
}

interface VenueCardProps {
  venue: Venue
}

const ClientPresta: React.FC = ({ route, navigation }) => {
  const { item } = route.params
  const derouler = item?.arrderoules || []

  const [activeDeroule, setActiveDeroule] = useState(derouler[0])

  const [step, setStep] = useState('deroule')
  const [data, setData] = React.useState([])

  if (derouler.length == 0) {
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

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {derouler.map((deroule, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              deroule.id === activeDeroule.id ? styles.activeTab : null, // Applique activeTab si c'est l'élément actif
            ]}
            onPress={() => {
              setActiveDeroule(deroule) // Mettre à jour l'index actif
            }}
          >
            <Text
              style={[
                styles.tabText,
                deroule.id === activeDeroule.id ? styles.activeTabText : null,
              ]}
            >
              {deroule.titre_deroule}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {derouler.length > 0 && activeDeroule && (
        <ClientPrestaCard activeDerouler={activeDeroule} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    marginRight: 16,
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  activeTab: {
    backgroundColor: '#ff3399',
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
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
    padding: 8,
  },
  venueName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: 150,
  },
  priceTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4ECCE6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  locationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
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
export default ClientPresta
