import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react'
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
  ActivityIndicator,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Colors } from './../constants/Colors'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'
import { AuthContext } from '../context/AuthContext'

interface Conversation {
  id: string
  type: 'presta' | 'client'
  user: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage: string
  timestamp: string
  unreadCount: number
}

interface ChatScreenProps {
  navigation: any
  route: {
    params: {
      admin: any
      id_deroule: string
      idevt: string
    }
  }
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme()
  const { admin, id_deroule, idevt } = route.params
  const { userdata } = useContext(AuthContext)
  const { getChatList } = useApi()

  // États
  const [chatData, setChatData] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'prestateurs' | 'clients'>(
    'prestateurs',
  )
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Mémorisation des conversations pour éviter les recalculs
  const prestaConversations = useMemo(() => {
    return (chatData.all_presta_interroges ?? []).map((presta: any) => ({
      id: presta.id_presta,
      type: 'presta' as const,
      user: {
        id: presta.id_presta,
        name: presta.nom_presta,
      },
      lastMessage: 'Appuyez pour voir la conversation',
      timestamp: "Aujourd'hui",
      unreadCount: 0,
    }))
  }, [chatData.all_presta_interroges])

  const clientConversations = useMemo(() => {
    if (Array.isArray(chatData.client)) {
      return chatData.client.map((client: any) => ({
        id: client.id_soc,
        type: 'client' as const,
        user: {
          id: `client-${client.id_soc}`,
          name: client.nom_soc,
        },
        lastMessage: 'Appuyez pour voir la conversation client',
        timestamp: "Aujourd'hui",
        unreadCount: 0,
      }))
    } else if (chatData.client) {
      return [
        {
          id: chatData.client.id,
          type: 'client' as const,
          user: {
            id: chatData.client.id,
            name: chatData.client.nom,
          },
          lastMessage: 'Entrez pour discuter',
          timestamp: "Aujourd'hui",
          unreadCount: 0,
        },
      ]
    }
    return []
  }, [chatData.client])

  // Filtrage des conversations avec mémorisation
  const filteredConversations = useMemo(() => {
    const conversations =
      activeTab === 'prestateurs' ? prestaConversations : clientConversations

    if (!searchQuery.trim()) {
      return conversations
    }

    return conversations.filter((conversation: Conversation) =>
      conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [activeTab, prestaConversations, clientConversations, searchQuery])

  // Fonction pour récupérer les données avec gestion du loading
  const getUserForchat = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await getChatList({
        idevt,
        admin,
        id_deroule,
      })

      console.log('Chat data:', response.data)
      setChatData(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error)
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les données du chat. Veuillez réessayer.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Réessayer', onPress: () => getUserForchat(isRefresh) },
        ],
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Effet pour charger les données au montage
  useEffect(() => {
    getUserForchat()
  }, [])

  // Gestion de la navigation vers la conversation
  const handleConversationPress = useCallback(
    (iduser2: string, userName: string) => {
      navigation.navigate('Inbox', {
        Receiver: userName,
        chat: {
          idevt,
          from_user: userdata.user.IDC,
          to_user: iduser2,
        },
      })
    },
    [navigation, idevt, userdata.user.IDC],
  )

  // Rendu optimisé des items de conversation
  const renderConversationItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item.id, item.user.name)}
        activeOpacity={0.7}
      >
        <Image
          source={require('../assets/images/splash.png')}
          style={styles.avatar}
          resizeMode="cover"
        />

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
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
    ),
    [handleConversationPress],
  )

  // Composant de liste vide
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Feather
        name={activeTab === 'prestateurs' ? 'users' : 'user'}
        size={48}
        color="#ccc"
      />
      <Text style={styles.emptyText}>
        {activeTab === 'prestateurs'
          ? 'Aucun prestataire disponible'
          : 'Aucun client disponible'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => getUserForchat()}
      >
        <Text style={styles.retryButtonText}>Actualiser</Text>
      </TouchableOpacity>
    </View>
  )

  // Composant de chargement
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary || '#007bff'} />
      <Text style={styles.loadingText}>Chargement des conversations...</Text>
    </View>
  )

  // Gestion du changement d'onglet
  const handleTabChange = useCallback((tab: 'prestateurs' | 'clients') => {
    setActiveTab(tab)
    setSearchQuery('') // Réinitialiser la recherche lors du changement d'onglet
  }, [])

  // Gestion du pull-to-refresh
  const handleRefresh = () => {
    getUserForchat(true)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        {renderLoading()}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Onglets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prestateurs' && styles.activeTab]}
          onPress={() => handleTabChange('prestateurs')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'prestateurs' && styles.activeTabText,
            ]}
          >
            Prestataires ({prestaConversations.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clients' && styles.activeTab]}
          onPress={() => handleTabChange('clients')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'clients' && styles.activeTabText,
            ]}
          >
            Clients ({clientConversations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={16}
          color="#7F7F7F"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#7F7F7F"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={16} color="#7F7F7F" />
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des conversations */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 82, // hauteur estimée de chaque item
          offset: 82 * index,
          index,
        })}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    color: '#333',
  },
  conversationsList: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
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
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
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
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
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
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default ChatScreen
