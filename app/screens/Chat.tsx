import React, { useContext, useEffect, useState, useCallback } from 'react'
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

  // Fonction pour transformer les données prestataires
  const getPrestaConversations = () => {
    if (
      !chatData.all_presta_interroges ||
      !Array.isArray(chatData.all_presta_interroges)
    ) {
      return []
    }

    // Utiliser un Set pour éviter les doublons basés sur l'ID
    const uniquePrestas = new Map()

    chatData.all_presta_interroges.forEach((presta: any) => {
      if (presta.id_presta && !uniquePrestas.has(presta.id_presta)) {
        uniquePrestas.set(presta.id_presta, {
          id: presta.id_presta,
          logo: presta.logo_presta,
          type: 'presta' as const,
          user: {
            id: presta.id_presta,
            name: presta.nom_presta,
          },
          lastMessage: 'Appuyez pour voir la conversation',
          timestamp: "Aujourd'hui",
          unreadCount: 0,
        })
      }
    })

    return Array.from(uniquePrestas.values())
  }

  // Fonction pour transformer les données clients
  const getClientConversations = () => {
    if (!chatData.client) {
      return []
    }

    const uniqueClients = new Map()

    if (Array.isArray(chatData.client)) {
      console.log('chatData.client', chatData.client)
      chatData.client.forEach((client: any) => {
        const clientId = client.id_soc || client.id
        if (clientId && !uniqueClients.has(clientId)) {
          uniqueClients.set(clientId, {
            id: clientId,
            type: 'client' as const,
            logo: client.logo_soc,
            user: {
              id: clientId,
              name: client.nom_soc || client.nom,
            },
            lastMessage: 'Appuyez pour voir la conversation client',
            timestamp: "Aujourd'hui",
            unreadCount: 0,
          })
        }
      })
    } else {
      const clientId = chatData.client.id_soc || chatData.client.id
      if (clientId) {
        uniqueClients.set(clientId, {
          id: clientId,
          type: 'client' as const,
          logo: chatData.client.logo_soc,
          user: {
            id: clientId,
            name: chatData.client.nom_soc || chatData.client.nom,
          },
          lastMessage: 'Entrez pour discuter',
          timestamp: "Aujourd'hui",
          unreadCount: 0,
        })
      }
    }

    return Array.from(uniqueClients.values())
  }

  // Fonction pour obtenir les conversations filtrées
  const getFilteredConversations = () => {
    let conversations: Conversation[] = []

    if (activeTab === 'prestateurs') {
      conversations = getPrestaConversations()
    } else {
      conversations = getClientConversations()
    }

    if (!searchQuery.trim()) {
      return conversations
    }

    return conversations.filter((conversation: Conversation) =>
      conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

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

  // Rendu des items de conversation
  const renderConversationItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item.id, item.user.name)}
        activeOpacity={0.7}
      >
        <Image
          source={
            item.logo
              ? { uri: item.logo }
              : require('../assets/images/splash.png')
          }
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

  // Obtenir les données pour l'affichage
  const filteredConversations = getFilteredConversations()
  const prestaCount = getPrestaConversations().length
  const clientCount = getClientConversations().length

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoading()}
      </SafeAreaView>
    )
  }

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
          <Text style={styles.headerTitle}>CHAT DU DEROULÉ</Text>
        </TouchableOpacity>
      </View>
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
            Prestataires ({prestaCount})
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
            Clients ({clientCount})
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
        keyExtractor={(item) => `${item.type}-${item.id}-${activeTab}`}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 50 ,
    gap: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    width: '90%',
    fontWeight: '600',
    color: '#000',
  },
  moreButton: {
    padding: 4,
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
    marginVertical: 11,
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
    fontWeight: '600',
    textTransform: 'uppercase',
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
