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
  StatusBar,
  Alert,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Colors } from './../constants/Colors'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'
import { AuthContext } from '../context/AuthContext'

interface Conversation {
  id: string
  user: {
    id: string
    name: string
    avatar: string
  }
  lastMessage: string
  timestamp: string
  unreadCount: number
}

interface ChatScreenProps {
  navigation: any
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme()
  const { admin, id_deroule, idevt } = route.params
  const { userdata } = useContext(AuthContext)

  const [chatData, setChatData] = useState<any>([])
  //console.log(admin, id_deroule, idevt)
  const { getChatList } = useApi()
  const [searchQuery, setSearchQuery] = useState('')

  const [activeTab, setActiveTab] = useState<'prestateurs' | 'clients'>(
    'prestateurs',
  )
  const prestaConversations = (chatData.all_presta_interroges ?? []).map(
    (presta) => ({
      id: presta.id_presta,
      type: 'presta',
      user: {
        id: presta.id_presta,
        name: presta.nom_presta,
      },
      lastMessage: 'Tap to view conversation',
      timestamp: 'Today',
      unreadCount: 0,
    }),
  )

  const clientConversations = chatData.client
    ? [
        {
          id: chatData.client.id,
          type: 'client',
          user: {
            id: chatData.client.id,
            name: chatData.client.nom,
          },
          lastMessage: 'Tap to view client conversation',
          timestamp: 'Today',
          unreadCount: 0,
        },
      ]
    : []

  const filteredPrestaConversations = (chatData.all_presta_interroges ?? [])
    .map((presta) => ({
      id: presta.id_presta,
      type: 'presta',
      user: {
        id: presta.id_presta,
        name: presta.nom_presta,
      },
      lastMessage: 'Tap to view conversation',
      timestamp: 'Today',
      unreadCount: 0,
    }))
    .filter((conversation) =>
      conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const filteredClientConversation = Array.isArray(chatData.client)
    ? chatData.client
        .filter((client) =>
          client.nom_soc?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((client) => ({
          id: client.id_soc,
          type: 'client',
          user: {
            id: `client-${client.id_soc}`,
            name: client.nom_soc,
          },
          lastMessage: 'Tap to view client conversation',
          timestamp: 'Today',
          unreadCount: 0,
        }))
    : []

  console.log(chatData.client)

  const getUserForchat = async () => {
    try {
      const response = await getChatList({
        idevt: idevt,
        admin: admin,
        id_deroule: id_deroule,
      })

      setChatData(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error)
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les données du déroulé. Veuillez réessayer.',
      )
    }
  }

  useEffect(() => {
    getUserForchat()
  }, [])

  const handleConversationPress = (iduser2: any, userName: string) => {
    // Naviguer vers l'écran de chat
    navigation.navigate('Inbox', {
      Receiver: userName,
      chat: {
        idevt: idevt,
        from_user: userdata.user.IDC,
        to_user: iduser2,
      },
    })
  }

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item.id, item.user.name)}
    >
      <Image
        source={{
          uri:
            'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?fit=crop&w=80&q=80',
        }}
        style={styles.avatar}
        resizeMode="cover"
      />

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, { fontWeight: 'bold' }]}>
            {item.user.name}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        <View style={styles.conversationFooter}>
          <Text
            style={styles.lastMessage}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>

          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {activeTab === 'prestateurs'
          ? 'Aucun prestataire disponible'
          : 'Aucun client disponible'}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prestateurs' && styles.activeTab]}
          onPress={() => setActiveTab('prestateurs')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'prestateurs' && styles.activeTabText,
            ]}
          >
            Prestataires
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clients' && styles.activeTab]}
          onPress={() => setActiveTab('clients')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'clients' && styles.activeTabText,
            ]}
          >
            Clients
          </Text>
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
          placeholder="Search chat..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#7F7F7F"
        />
      </View>

      <FlatList
        data={
          activeTab === 'prestateurs'
            ? filteredPrestaConversations
            : filteredClientConversation
        }
        renderItem={renderConversationItem}
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
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
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
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
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
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activeNavText: {
    color: '#007AFF',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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

export default ChatScreen
