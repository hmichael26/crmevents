import React, { useState } from 'react'
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'

const ClientAutoDropdownComplete = ({
  placeholder,
  value,
  onChangeText,
  data = [], // Liste des suggestions
  style,
  maxSuggestions = 5,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredClients, setFilteredClients] = useState([])

  const handleTextChange = (text) => {
    onChangeText(text)

    if (text.length > 0) {
      // Filtrer les clients basés sur le nom
      const filtered = data
        .filter((client) =>
          client.nom.toLowerCase().includes(text.toLowerCase()),
        )
        .slice(0, maxSuggestions)

      setFilteredClients(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
      setFilteredClients([])
    }
  }

  const handleSuggestionPress = (client) => {
    onChangeText(client.nom)
    setShowSuggestions(false)
    setFilteredClients([])
  }

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionText}>{item.nom}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, style]}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={handleTextChange}
        style={styles.textInput}
      />

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredClients}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={renderSuggestion}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  textInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    position: 'relative',
    zIndex: 1000,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
})

export default ClientAutoDropdownComplete
