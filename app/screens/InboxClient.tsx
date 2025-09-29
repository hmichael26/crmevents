import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Colors } from './../constants/Colors'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'
import { AuthContext } from '../context/AuthContext'

interface Deroule {
  comm_deroule: string
  fk_evt: string
  id: string
  numero_deroule: string
  titre_deroule: string
  titre_evt: string
}

interface ChatScreenProps {
  navigation: any
  route: any
}

const InboxClient: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme()
  const { item } = route.params
  const derouler = item?.arrderoules || []
  const { userdata } = useContext(AuthContext)

  const [derouleItems, setDerouleItems] = useState<Deroule[]>(
    derouler ? derouler : [],
  )
  const [searchQuery, setSearchQuery] = useState('')
  const { getDerouleList } = useApi()

  // Sample data - in a real app, this would come from an API

  const filteredDerouleItems = derouleItems.filter((item) =>
    item.titre_deroule.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeroulePress = (
    idevt: any,
    derouleId: string,
    derouleTitle: string,
  ) => {
    // Navigate to chat with admin for this specific deroule
    navigation.navigate('Inbox', {
      Receiver: `Admin - ${derouleTitle}`,
      chat: {
        idevt: idevt,
        from_user: userdata.user.IDC,
        //iduser2: admin, // Admin ID
        id_deroule: derouleId,
      },
    })
  }

  const renderDerouleItem = ({ item }: { item: Deroule }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() =>
        handleDeroulePress(item.fk_evt, item.id, item.titre_deroule)
      }
    >
      <View style={styles.derouleNumberContainer}>
        <Image
          source={require('../assets/images/splash.png')}
          style={{ width: 45, height: 45, borderRadius: 20 }}
          resizeMode="cover"
        />
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, { fontWeight: 'bold' }]}>
            {item.titre_deroule}
          </Text>
        </View>

        <View style={styles.conversationFooter}>
          <Text
            style={styles.lastMessage}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.comm_deroule || 'Discuter avec votre conseiller sur ce sujet'}
          </Text>
        </View>
      </View>

      <Feather name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aucun déroulé disponible</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButton}>
            <Feather name="arrow-left" size={25} color="#303133" />
          </View>
          <Text style={styles.headerTitle}>CHATTER AVEC L'ADMIN</Text>
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={16}
          color="#7F7F7F"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un déroulé..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#7F7F7F"
        />
      </View>

      <FlatList
        data={filteredDerouleItems}
        renderItem={renderDerouleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FC',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#F7F7F7',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    minHeight: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    fontSize: 16,
    color: ' #7F7F7F',
  },
  conversationsList: {
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  derouleNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  derouleNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    color: '#000',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#303133',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
})

export default InboxClient
