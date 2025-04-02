import React, { useState } from 'react'
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
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Colors } from './../constants/Colors'
import { useTheme } from '../hooks'

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

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Amanda',
        avatar: 'https://example.com/avatar1.jpg',
      },
      lastMessage: 'Can you please tell me how it wor...',
      timestamp: '4:27',
      unreadCount: 1,
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'Nick',
        avatar: 'https://example.com/avatar2.jpg',
      },
      lastMessage: 'Hi! hope your are doing well...',
      timestamp: '3/2/2023',
      unreadCount: 2,
    },
    {
      id: '3',
      user: {
        id: 'user3',
        name: 'Emma',
        avatar: 'https://example.com/avatar3.jpg',
      },
      lastMessage: 'Can you please tell me how it wor...',
      timestamp: '3/2/2023',
      unreadCount: 0,
    },
    {
      id: '4',
      user: {
        id: 'user4',
        name: 'Steve Smith',
        avatar: 'https://example.com/avatar4.jpg',
      },
      lastMessage: 'Can you please tell me how it wor...',
      timestamp: '3/2/2023',
      unreadCount: 0,
    },
    {
      id: '5',
      user: {
        id: 'user5',
        name: 'Olivia',
        avatar: 'https://example.com/avatar5.jpg',
      },
      lastMessage: 'Can you please tell me how it wor...',
      timestamp: '3/2/2023',
      unreadCount: 0,
    },
    {
      id: '6',
      user: {
        id: 'user6',
        name: 'Nelson Neil',
        avatar: 'https://example.com/avatar6.jpg',
      },
      lastMessage: 'Can you please tell me how it wor...',
      timestamp: '3/2/2023',
      unreadCount: 0,
    },
    {
      id: '7',
      user: {
        id: 'user7',
        name: 'Evelyn Luna',
        avatar: 'https://example.com/avatar7.jpg',
      },
      lastMessage: 'Can you please tell me how it wor...',
      timestamp: '3/2/2023',
      unreadCount: 0,
    },
  ])

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleConversationPress = (
    conversationId: string,
    userName: string,
  ) => {
    // Naviguer vers l'écran de chat
    navigation.navigate('Inbox', { conversationId, Receiver: userName })
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
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

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
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
})

export default ChatScreen
