import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Animated,
  Platform,
  Dimensions,
} from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome'

interface Client {
  id: number
  nom: string
}

interface SimpleDropdownProps {
  clients: Client[]
  value: string
  onChangeText: (text: string) => void
  onSelectClient?: (client: Client | null) => void
  placeholder?: string
  style?: any
  inputStyle?: any
  maxHeight?: number
  autoCompleteThreshold?: number
}

const ClientAutoDropdownComplete: React.FC<SimpleDropdownProps> = ({
  clients,
  value,
  onChangeText,
  onSelectClient,
  placeholder = 'Prénom NOM',
  style,
  inputStyle,
  maxHeight = 200,
  autoCompleteThreshold = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const animatedHeight = useRef(new Animated.Value(0)).current
  const inputRef = useRef<TextInput>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Filtrer les clients en temps réel
  useEffect(() => {
    if (value.length >= autoCompleteThreshold && isOpen) {
      const filtered = clients
        .filter((client) =>
          client.nom.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 8) // Limiter à 8 résultats max

      setFilteredClients(filtered)
    } else {
      setFilteredClients([])
    }
  }, [value, clients, autoCompleteThreshold, isOpen])

  // Animation du dropdown
  useEffect(() => {
    const targetHeight =
      isOpen && filteredClients.length > 0
        ? Math.min(filteredClients.length * 50, maxHeight)
        : 0

    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isOpen, filteredClients, maxHeight])

  const handleInputFocus = () => {
    // Annuler le timeout de fermeture si il existe
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Augmenter le délai et utiliser une ref pour pouvoir l'annuler
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      blurTimeoutRef.current = null
    }, 300) // Augmenté à 300ms
  }

  const handleSelectClient = (client: Client) => {
    console.log('Client sélectionné:', client)

    // Annuler le timeout de fermeture
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }

    onChangeText(client.nom)
    setIsOpen(false)
    inputRef.current?.blur()

    if (onSelectClient) {
      onSelectClient(client)
    }
  }

  const clearSelection = () => {
    onChangeText('')
    setIsOpen(false)
    if (onSelectClient) {
      onSelectClient(null)
    }
  }

  const renderClientItem = ({
    item,
    index,
  }: {
    item: Client
    index: number
  }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        index === filteredClients.length - 1 && { borderBottomWidth: 0 },
      ]}
      onPress={() => handleSelectClient(item)}
      activeOpacity={0.7}
      // Ajout de propriétés pour améliorer la réactivité
      delayPressIn={0}
      delayPressOut={0}
    >
      <Icon name="user-o" color="#666" size={16} />
      <Text style={styles.dropdownItemText}>{item.nom}</Text>
    </TouchableOpacity>
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputContainer, inputStyle]}>
        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize="words"
        />

        <View style={styles.inputActions}>
          {value.length > 0 && (
            <TouchableOpacity
              onPress={clearSelection}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Icon name="times" color="#999" size={14} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dropdown list - Version simplifiée et plus fiable */}
      <Animated.View style={[styles.dropdown, { height: animatedHeight }]}>
        {isOpen && filteredClients.length > 0 && (
          <FlatList
            data={filteredClients}
            renderItem={({ item, index }) => renderClientItem({ item, index })}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {isOpen &&
          value.length >= autoCompleteThreshold &&
          filteredClients.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun client trouvé</Text>
            </View>
          )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 5000,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 13,
    backgroundColor: 'white',
    minHeight: 45,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },

  // Dropdown - Styles améliorés
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: 1001,
    overflow: 'hidden',
    // Ajout d'une élévation pour Android
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
    zIndex: 1000,
    // Assurer que l'item est bien touchable
    minHeight: 50,
  },
  dropdownItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
})

export default ClientAutoDropdownComplete
