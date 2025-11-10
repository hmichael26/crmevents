import React, { useState, useRef, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Keyboard,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as DocumentPicker from 'expo-document-picker'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'
import { AuthContext } from '../context/AuthContext'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'other'
  timestamp: number
  attachment?: {
    name: string
    type: string
    url: string
  }
  audioUrl?: string
}

interface InboxScreenProps {
  navigation: any
  route: any
}

const InboxScreen: React.FC<InboxScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme()
  const { getChat, sendChat } = useApi()

  const { userdata } = useContext(AuthContext)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const param = route.params

  //console.log(param)
  //console.log(param)

  const [menuVisible, setMenuVisible] = useState(false)

  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [
    selectedAttachment,
    setSelectedAttachment,
  ] = useState<DocumentPicker.DocumentResult | null>(null)

  const flatListRef = useRef<FlatList>(null)

  // Cleanup function for audio
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
      if (recording) {
        recording.stopAndUnloadAsync()
      }
    }
  }, [sound, recording])

  useEffect(() => {
    // Charger immédiatement au montage
    loadMessages()

    // Définir l'intervalle de 60 secondes
    const interval = setInterval(() => {
      loadMessages()
    }, 60000) // 60 000 ms = 1 minute

    // Nettoyer l'intervalle au démontage du composant
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height)
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      },
    )

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
      },
    )

    return () => {
      keyboardDidHideListener?.remove()
      keyboardDidShowListener?.remove()
    }
  }, [])

  const loadMessages = async () => {
    try {
      const response = await getChat({
        idevt: param.chat.idevt,
        user1: param.chat.from_user,
        user2: param.chat.to_user ? param.chat.to_user : '9',
      })

      // console.log(response.data)
      setMessages(response.data.all_chats)
    } catch (error) {
      console.error('Error loading messages:', error)
      Alert.alert('Error', 'Failed to load messages. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadMessages()
  }

  const handleSend = async () => {
    if (!inputText.trim() && !selectedAttachment) return

    setIsSending(true)

    try {
      const messagePayload: any = {
        message: inputText.trim(),
        ...param.chat,
      }
      //   console.log(messagePayload)

      /*
      // Gérer la pièce jointe
      if (
        selectedAttachment &&
        !('canceled' in selectedAttachment) &&
        selectedAttachment.assets &&
        selectedAttachment.assets.length > 0
      ) {
        const asset = selectedAttachment.assets[0]

        // Tu pourrais uploader le fichier ici d'abord si besoin
        messagePayload.attachment = {
          name: asset.name || 'File',
          type: asset.mimeType?.split('/')[1] || 'unknown',
          url: asset.uri, // à remplacer par l'URL de retour si upload
        }

        setSelectedAttachment(null)
      }*/

      // Appel API pour envoyer le message
      // console.log(messagePayload)
      const response = await sendChat(messagePayload)

      //console.log(response)

      loadMessages()
      setInputText('')

      // Scroll automatique à la fin
      flatListRef.current?.scrollToEnd({ animated: true })
    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Erreur', 'Envoi du message échoué.')
    } finally {
      setIsSending(false)
    }
  }

  const handleDownloadAttachment = (attachment: ChatMessage['attachment']) => {
    if (!attachment) return

    if (attachment.url.startsWith('file://')) {
      Alert.alert(
        "Impossible d'ouvrir",
        "Ce fichier est local et ne peut pas être ouvert directement. Uploade-le d'abord ou ouvre-le via un lecteur intégré.",
      )
      return
    }

    Linking.openURL(attachment.url).catch((err) => {
      console.error('Error opening attachment:', err)
      Alert.alert('Erreur', "Impossible d'ouvrir le fichier.")
    })
  }

  // 🟢 DOCUMENT PICKER
  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })

      console.log('Document picker result:', result)

      if (result && result.canceled === false && result.assets?.length > 0) {
        setSelectedAttachment(result)

        const asset = result.assets[0]

        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          text: '',
          sender: 'user',
          timestamp: Date.now(),
          attachment: {
            name: asset.name || 'Fichier',
            type: asset.mimeType?.split('/')[1] || 'file',
            url: asset.uri,
          },
        }

        setMessages((prev) => [...prev, newMessage])
        flatListRef.current?.scrollToEnd({ animated: true })
      } else {
        Alert.alert('Aucun fichier sélectionné')
      }
    } catch (error) {
      console.error('Erreur document picker:', error)
      Alert.alert('Erreur', 'Impossible de choisir un fichier')
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const transformedMessages = Array.isArray(messages)
    ? messages.map((msg) => ({
        id: msg.id,
        text: msg.message,
        senderId: msg.id_from_user,
        receiverId: msg.id_to_user,
        date: new Date(msg.date),
        isRead: msg.st_lecture === '1',
        type: msg.type || 'user',
      }))
    : []

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUserMessage = item.senderId === userdata.user.IDC

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage
            ? styles.userMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {item.text ? (
          <View
            style={[
              styles.messageBubble,
              isUserMessage
                ? styles.userMessageBubble
                : styles.otherMessageBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUserMessage
                  ? styles.userMessageText
                  : styles.otherMessageText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        ) : null}

        {item.attachment && (
          <View
            style={[
              styles.attachmentContainer,
              isUserMessage
                ? styles.userAttachmentContainer
                : styles.otherAttachmentContainer,
            ]}
          >
            <View style={styles.attachmentIconContainer}>
              <Feather
                name={
                  item.attachment.type === 'pdf'
                    ? 'file-text'
                    : item.attachment.type.includes('image')
                    ? 'image'
                    : 'file'
                }
                size={20}
                color="#FF3B30"
              />
            </View>
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName}>{item.attachment.name}</Text>
              <Text style={styles.attachmentType}>
                {item.attachment.type.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownloadAttachment(item.attachment)}
            >
              <Feather name="download" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        <Text
          style={[
            styles.messageTime,
            isUserMessage ? styles.userMessageTime : styles.otherMessageTime,
          ]}
        >
          {formatTime(item.date)}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
      >
        <TouchableOpacity
          style={styles.header}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#000" />
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {param?.isForClient
              ? param?.Receiver || 'CONVERSATION'
              : 'CONVERSATION AVEC ' + param?.Receiver || 'CONVERSATION'}
          </Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement des messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={transformedMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Pas de nouveaux message</Text>
                <Text style={styles.emptySubtext}>Commencez à discuter !</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputContainer}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 10,
              paddingHorizontal: 6,
              marginHorizontal: 6,
            }}
          >
            <TextInput
              style={styles.input}
              placeholder="Envoyer un message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              placeholderTextColor={colors.text}
              onFocus={() => {
                // Scroll vers le bas quand l'input est focalisé
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true })
                }, 200)
              }}
            />

            <View style={styles.innerShadow} />
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="send" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 0 : 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 20,
    gap: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 14,
    width: '90%',
    fontWeight: '600',
    color: '#000',
  },
  moreButton: {
    padding: 4,
  },
  productInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  productLocation: {
    fontSize: 14,
    color: '#666',
  },
  productPriceContainer: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 2,
  },
  productDate: {
    fontSize: 12,
    color: '#999',
  },
  messagesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
  },
  userMessageBubble: {
    backgroundColor: '#F7F7F7',
  },
  otherMessageBubble: {
    backgroundColor: '#E6F0FC',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#000',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 2,
  },
  userMessageTime: {
    color: '#999',
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: '#999',
    alignSelf: 'flex-start',
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#F7F7F7',
  },
  userAttachmentContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#F7F7F7',
  },
  otherAttachmentContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F0FC',
  },
  attachmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  attachmentType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  downloadButton: {
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachButton: {
    padding: 8,
    position: 'relative',
  },
  attachmentBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 15,
    marginHorizontal: 12,
    minHeight: 50,
    backgroundColor: 'transparent',
    zIndex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  sendingButton: {
    backgroundColor: '#80BDFF',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  innerShadow: {
    position: 'absolute',
    top: 1,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: '#0000000A', // Simule l'ombre
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginHorizontal: 4,
  },
  audioPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 4,
  },
  audioPlayText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF3B30',
  },
})

export default InboxScreen
