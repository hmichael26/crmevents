import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useApi } from '../context/useApi'

// Define an interface for Item for better type checking
interface Item {
  id: number
  name: string
}

interface SelectionModalProps {
  field: string
  onSelectItem: (item: Item) => void
  onClose: () => void
  initialItem?: Item // Now declared properly as an optional prop
  onEditItem?: (item: Item) => void // Optional function for editing an item
  onDeleteItem?: (item: Item) => void // Optional function for deleting an item
  visible: boolean
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  field,
  onSelectItem,
  onClose,
  initialItem,
  onEditItem,
  onDeleteItem,
  visible,
}) => {
  const { getprestaprms } = useApi()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    initialItem || null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])

  const handleFocus = useCallback(async (searchBy: string) => {
    console.log(searchBy)
    setIsLoading(true)
    try {
      const response = await getprestaprms({ searchby: searchBy })
      setItems(
        searchBy === 'ville'
          ? response.data.all_cities
          : response.data[`all_${searchBy}s`] || [],
      )
    } catch (error) {
      console.error(`Erreur lors du chargement des ${searchBy}s:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (visible) {
      switch (field) {
        case 'fk_departement':
          handleFocus('dept')
          break
        case 'fk_ville':
          handleFocus('ville')
          break
        case 'fk_region':
          handleFocus('region')
          break
        default:
          console.warn('Field not recognized')
      }
    }
  }, [visible, field])

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.clientItemContainer}>
      <TouchableOpacity
        style={styles.clientItemDetails}
        onPress={() => {
          onSelectItem(item)
          setSelectedItem(item)
        }}
      >
        <Icon name="user-o" color="#666" size={24} />
        <View style={styles.clientTextContainer}>
          <Text style={styles.clientName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          onClose()
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isLoading ? (
              <Text>Loading...</Text>
            ) : (
              <>
                <View style={styles.searchContainer}>
                  <Icon name="search" color="#666" size={20} />
                  <TextInput
                    placeholder="Search for an item"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <FlatList
                  data={filteredItems}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderItem}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No items found</Text>
                    </View>
                  )}
                />
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    backgroundColor: 'white',
  },
  inputText: {
    marginLeft: 10,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  clientItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientTextContainer: {
    marginLeft: 15,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clientSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  clientActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  closeButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  closeButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
})
export default SelectionModal
