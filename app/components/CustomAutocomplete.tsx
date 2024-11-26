import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';

interface AutocompleteProps {
  data: string[];
  onSelect: (item: string) => void;
  placeholder?: string;
  style?: any;
}

const CustomAutocomplete: React.FC<AutocompleteProps> = ({ 
  data, 
  onSelect, 
  placeholder = 'Search...',
  style 
}) => {
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    
    // Filter data based on input
    const filtered = data.filter(item => 
      item.toLowerCase().includes(text.toLowerCase())
    );
    
    setFilteredData(filtered);
    setShowSuggestions(text.length > 0 && filtered.length > 0);
  };

  const handleSelectItem = (item: string) => {
    setQuery(item);
    onSelect(item);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, style]}
        value={query}
        onChangeText={handleSearch}
        placeholder={placeholder}
        onFocus={() => {
          if (query.length > 0 && filteredData.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          // Small delay to allow item selection
          setTimeout(() => setShowSuggestions(false), 200);
        }}
      />
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => handleSelectItem(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    zIndex: 1000000,
  },
  input: {
   
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: 1000000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default CustomAutocomplete;