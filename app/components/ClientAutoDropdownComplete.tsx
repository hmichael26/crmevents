'use client'

import { useState, useRef } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native'

const ClientAutoDropdownComplete = ({
  placeholder,
  value,
  onChangeText,
  data = [],
  style,
  maxSuggestions = 5,
  useModal = false, // Option pour utiliser une Modal
}) => {
  //  console.log(data)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredClients, setFilteredClients] = useState([])
  const [modalVisible, setModalVisible] = useState(false)

  const textInputRef = useRef(null)

  const handleTextChange = (text) => {
    onChangeText(text)

    if (text.length > 0) {
      const filtered = data
        .filter((client) =>
          client.nom.toLowerCase().includes(text.toLowerCase()),
        )
        .slice(0, maxSuggestions)

      setFilteredClients(filtered)

      if (useModal) {
        setModalVisible(filtered.length > 0)
      } else {
        setShowSuggestions(filtered.length > 0)
      }
    } else {
      setShowSuggestions(false)
      setFilteredClients([])
      setModalVisible(false)
    }
  }

  const handleSuggestionPress = (client) => {
    onChangeText(client.nom)
    setShowSuggestions(false)
    setFilteredClients([])
    setModalVisible(false)
    Keyboard.dismiss()
  }

  const handleOutsidePress = () => {
    setShowSuggestions(false)
    setFilteredClients([])
    setModalVisible(false)
    Keyboard.dismiss()
  }

  const renderSuggestionItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionText}>{item.nom}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView>
      <View style={[styles.container, style]}>
        <TextInput
          placeholderTextColor={'#000'}
          ref={textInputRef}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        {/* Version avec Modal - évite complètement les conflits de clavier */}
        {useModal ? (
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={filteredClients}
                    renderItem={renderSuggestionItem}
                    keyExtractor={(item, index) =>
                      item.id ? item.id.toString() : index.toString()
                    }
                    style={styles.modalList}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        ) : (
          /* Version standard améliorée */
          showSuggestions && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredClients}
                renderItem={renderSuggestionItem}
                keyExtractor={(item, index) =>
                  item.id ? item.id.toString() : index.toString()
                }
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              />
            </View>
          )
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    maxHeight: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1001,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 44,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  // Styles pour la Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 300,
    width: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalList: {
    maxHeight: 250,
  },
})

export default ClientAutoDropdownComplete
