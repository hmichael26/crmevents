import React, { useState, useRef, useEffect } from 'react'
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
  StatusBar,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as DocumentPicker from 'expo-document-picker'
import { useTheme } from '../hooks'
import { useApi } from '../context/useApi'

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
  const { getChat } = useApi()

  const param = route.params
  // console.log(param)

  const [menuVisible, setMenuVisible] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
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

  // Simuler le chargement des messages
  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const response = await getChat({
        ...param.chat,
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
      // Create a new message
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
        timestamp: Date.now(),
      }

      // If there's an attachment, add it to the message
      if (
        selectedAttachment &&
        !('canceled' in selectedAttachment) &&
        selectedAttachment.assets &&
        selectedAttachment.assets.length > 0
      ) {
        const asset = selectedAttachment.assets[0]
        newMessage.attachment = {
          name: asset.name || 'File',
          type: asset.mimeType?.split('/')[1] || 'unknown',
          url: asset.uri,
        }
        setSelectedAttachment(null)
      }

      // Add the message to the list
      setMessages((prevMessages) => [...prevMessages, newMessage])

      // Clear the input field
      setInputText('')

      // Simulate sending the message to the API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simulate an automatic reply after a delay
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I've received your message. I'll get back to you soon.",
          sender: 'other',
          timestamp: Date.now() + 1000,
        }

        setMessages((prevMessages) => [...prevMessages, autoReply])

        // Scroll to the last message
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 2000)
    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Error', 'Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleDownloadAttachment = (attachment: ChatMessage['attachment']) => {
    if (!attachment) return

    if (attachment.url.startsWith('file://')) {
      Alert.alert(
        'Impossible d’ouvrir',
        'Ce fichier est local et ne peut pas être ouvert directement. Uploade-le d’abord ou ouvre-le via un lecteur intégré.',
      )
      return
    }

    Linking.openURL(attachment.url).catch((err) => {
      console.error('Error opening attachment:', err)
      Alert.alert('Erreur', 'Impossible d’ouvrir le fichier.')
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

  // Expo Audio Recording functions
  // 🟢 START RECORDING
  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        return Alert.alert(
          'Permission refusée',
          'Activez le micro dans les réglages.',
        )
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )

      setRecording(recording)
      setIsRecording(true)
      console.log('Recording started')
    } catch (err) {
      console.error('Start recording error:', err)
      Alert.alert('Erreur', "Impossible de démarrer l'enregistrement")
    }
  }

  // 🟢 STOP RECORDING
  async function stopRecording() {
    if (!recording) return

    try {
      setIsRecording(false)
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setRecording(null)

      if (!uri) {
        return Alert.alert('Erreur', 'Aucun fichier audio enregistré')
      }

      console.log('Recorded URI:', uri)

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: '🎤 Voice note',
        sender: 'user',
        timestamp: Date.now(),
        audioUrl: uri,
      }

      setMessages((prev) => [...prev, newMessage])
      flatListRef.current?.scrollToEnd({ animated: true })
    } catch (err) {
      console.error('Stop recording error:', err)
      Alert.alert('Erreur', "Problème lors de l'enregistrement")
    }
  }

  // 🟢 TOGGLE MICROPHONE
  const handleMicPress = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const playAudio = async (audioUrl: string, messageId: string) => {
    try {
      // If there's already a sound playing, stop it
      if (sound) {
        await sound.stopAsync()
        await sound.unloadAsync()
        setSound(null)

        // If we're stopping the same audio, just return
        if (playingAudioId === messageId) {
          setPlayingAudioId(null)
          return
        }
      }

      // Load and play the new audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
      )

      setSound(newSound)
      setPlayingAudioId(messageId)

      // When audio finishes playing
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudioId(null)
        }
      })
    } catch (error) {
      console.error('Error playing audio:', error)
      Alert.alert('Error', 'Failed to play audio message.')
      setPlayingAudioId(null)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUserMessage = item.sender === 'user'
    const isPlaying = playingAudioId === item.id

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

            {item.audioUrl && (
              <TouchableOpacity
                style={styles.audioPlayButton}
                onPress={() => playAudio(item.audioUrl!, item.id)}
              >
                <Feather
                  name={isPlaying ? 'pause' : 'play'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.audioPlayText}>
                  {isPlaying ? 'Playing...' : 'Play voice message'}
                </Text>
              </TouchableOpacity>
            )}
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
                size={24}
                color="#FF3B30"
              />
            </View>
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName}>{item.attachment.name}</Text>
              <Text style={styles.attachmentType}>{item.attachment.type}</Text>
            </View>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownloadAttachment(item.attachment)}
            >
              <Feather name="download" size={20} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        )}

        <Text
          style={[
            styles.messageTime,
            isUserMessage ? styles.userMessageTime : styles.otherMessageTime,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>{param.Receiver}</Text>

      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#303133" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{param.Receiver}</Text>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true })
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          }
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachment}
          >
            <Feather name="paperclip" size={22} color="#666" />
            {selectedAttachment &&
              !('canceled' in selectedAttachment) &&
              selectedAttachment.assets && (
                <View style={styles.attachmentBadge} />
              )}
          </TouchableOpacity>
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
              placeholder="Send message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              placeholderTextColor={colors.text}
            />

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
            <View style={styles.innerShadow} />
          </View>
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && { backgroundColor: '#ffeeee' },
            ]}
            onPress={handleMicPress}
          >
            <Feather
              name={isRecording ? 'mic-off' : 'mic'}
              size={24}
              color={isRecording ? '#ff4444' : colors.text}
            />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 18,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
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
