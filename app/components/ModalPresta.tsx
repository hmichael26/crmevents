import React, { useState, useEffect, useCallback, useRef } from 'react'
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
import useTheme from './../hooks/useTheme'
import Button from './Button'

// Define an interface for Item for better type checking
interface Item {
  id: number
  nom: string
}

interface ModalPrestaProps {
  onClose: () => void
  onSelectItem: (item: Item) => void
  nom?: string
}
const ModalPresta: React.FC<ModalPrestaProps> = ({
  onClose,
  onSelectItem,
  nom,
}) => {
  const { gradients } = useTheme()
  const { getPrestaBy, searchPresta } = useApi()
  const [modalVisible, setModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [selectPresta, setSelectPresta] = useState<any | null>(null)
  const [timer, setTimer] = useState(null)
  const prevSearchQuery = useRef('')
  const isFirstRender = useRef(true)

  const fetchItems = useCallback(
    async (page: number, query?: string) => {
      setIsLoading(true)

      try {
        const params = {
          current_page: page,
          ...(query ? { search: query } : {}),
        }

        const response = query
          ? await searchPresta(params)
          : await getPrestaBy(params)

        /* // Pour la pagination, on accumule les résultats si ce n'est pas une nouvelle recherche
             if (page > 1 && query === prevSearchQuery.current) {
                 setItems(prevItems => [...prevItems, ...(response.data.all_prests || [])]);
             } else {
                 setItems(response.data.all_prests || []);
             }*/
        setItems(response.data.all_prests || [])
        setTotalPages(Math.ceil(response.data.nb_tot_presta / 30))
      } catch (error) {
        console.error('Error loading items:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [getPrestaBy, searchPresta],
  )

  // console.log('ok', searchQuery, prevSearchQuery.current);
  // Effet pour la recherche avec debounce
  useEffect(() => {
    if (!modalVisible) return

    // Skip the first render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Vérifier si la recherche a changé
    if (searchQuery !== prevSearchQuery.current) {
      const debounceTimeout = setTimeout(() => {
        setCurrentPage(1)
        fetchItems(1, searchQuery)
        prevSearchQuery.current = searchQuery
      }, 2000)

      return () => clearTimeout(debounceTimeout)
    }
  }, [searchQuery, modalVisible, fetchItems])

  // Effet pour la pagination
  useEffect(() => {
    if (!modalVisible) return

    // Ne pas déclencher de recherche si c'est la première page (déjà géré par l'effet de recherche)
    if (currentPage >= 1) {
      fetchItems(currentPage, prevSearchQuery.current)
    }
  }, [currentPage, modalVisible])

  // Effet pour charger les données initiales quand le modal s'ouvre
  useEffect(() => {
    if (modalVisible) {
      setCurrentPage(1)
      setSearchQuery('')
      prevSearchQuery.current = ''
      fetchItems(1)
    }
  }, [modalVisible])

  const handleSelectItem = (item: Item) => {
    //  console.log(item);

    onSelectItem(item)
    //    setSelectPresta(item);
    setModalVisible(false)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((current) => current + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((current) => current - 1)
    }
  }

  const handleSearch = (query: string) => {
    // Perform the search operation
    console.log('Searching for:', query)
    // Add your search function here
  }

  function formatName(name) {
    const maxLength = 25
    if (name.length > maxLength) {
      name = name.substring(0, maxLength) // Truncate to 25 characters
    }
    return name.padEnd(maxLength) // Fill with dashes if less than 25 characters
  }
  return (
    <View>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.clientName}>
          {nom ? formatName(nom) : 'selectionner un prestataire'}
        </Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false)
          onClose()
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <>
              <View style={styles.searchContainer}>
                <Icon name="search" color="#666" size={20} />
                <TextInput
                  placeholder="Search for a provider"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              {isLoading ? (
                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  Chargement...
                </Text>
              ) : (
                <FlatList
                  data={items}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectItem(item)}
                      style={styles.itemContainer}
                    >
                      <Text style={styles.itemName}>{item.nom}</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Text
                          style={{ color: '#666', fontSize: 14, marginTop: 2 }}
                        >
                          departement: {item.fk_departement}
                        </Text>
                        <Text
                          style={{ color: '#666', fontSize: 14, marginTop: 2 }}
                        >
                          ville: {item.ville}
                        </Text>
                        <Text
                          style={{ color: '#666', fontSize: 14, marginTop: 2 }}
                        >
                          region: {item.region}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
              <View style={styles.paginationContainer}>
                <Button
                  onPress={handlePreviousPage}
                  disabled={currentPage <= 1}
                  gradient={gradients.secondary}
                >
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    Prev
                  </Text>
                </Button>
                <Text>
                  {currentPage} of {totalPages}
                </Text>
                <Button
                  onPress={handleNextPage}
                  disabled={currentPage >= totalPages}
                  gradient={gradients.secondary}
                >
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    Next
                  </Text>
                </Button>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
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
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  inputText: {
    marginLeft: 10,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
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
  containerR: {
    flexDirection: 'row', // Align children in a row
    justifyContent: 'space-between', // Space out children evenly across the container
    alignItems: 'center', // Center items vertically within the row
    marginTop: 10, // Top margin
    flexWrap: 'wrap', // Allow items to wrap to next line on overflow
  },
  text: {
    color: '#666', // Text color
    fontSize: 14, // Text font size
    marginTop: 2, // Top margin for each text
    flex: 1, // Give each text box an equal opportunity to grow
    minWidth: 100, // Minimum width for each text element to avoid squeezing too much
    textAlign: 'center', // Center-align text
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

export default ModalPresta
