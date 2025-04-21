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
import { Button } from '../components'
import { useTheme } from '../hooks'

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
  const { colors, sizes, gradients } = useTheme()
  const { item } = route.params
  const { getDerouler } = useApi()
  const derouler = item?.arrderoules || []

  const [activeDeroule, setActiveDeroule] = useState(derouler[0])
  const [deroulerData, setDeroulerData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDeroulerData = async () => {
    if (!activeDeroule?.id) return

    setLoading(true)
    try {
      console.log('Fetching derouler data for ID:', activeDeroule.id)
      const response = await getDerouler({ id_deroule: activeDeroule.id })
      setDeroulerData(response.data)
    } catch (error) {
      console.error('Error fetching déroulé data:', error)
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les données du déroulé. Veuillez réessayer.',
      )
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when active deroule changes
  useEffect(() => {
    if (activeDeroule?.id) {
      fetchDeroulerData()
    }
  }, [activeDeroule])

  if (derouler.length === 0) {
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
          <Button
            key={index}
            gradient={
              deroule.id === activeDeroule.id
                ? gradients.primary
                : gradients.secondary
            }
            style={[styles.tab]}
            onPress={() => {
              setActiveDeroule(deroule)
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
          </Button>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.danger, fontSize: 30 }}>
            Chargement...
          </Text>
        </View>
      ) : (
        derouler.length > 0 &&
        activeDeroule && (
          <ClientPrestaCard
            activeDerouler={activeDeroule}
            eventData={{ id_evt: item.idevt, id_client: item.clt_id }}
            deroulerData={deroulerData}
            refreshData={fetchDeroulerData} // Pass the refresh function to child component
          />
        )
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
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ClientPresta
