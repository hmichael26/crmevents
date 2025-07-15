import React, { useState, useEffect, useContext } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { useTheme } from '../hooks'
import { AuthContext } from '../context/AuthContext'
import Button from './Button'
import { GRADIENTS } from '../constants/light'
import { useApi } from '../context/useApi'

interface Deroule {
  id: string
  titre_deroule: string
  numero_deroule: string
}

interface ArrDeroule {
  idevt: string
  evt: string
  arrderoules: Deroule[]
}

interface DeroulesModalProps {
  isVisible: boolean
  onClose: () => void
  onAssign: (arrDeroule: any, selectedDeroule: any) => Promise<void>
}

const DeroulesModal: React.FC<DeroulesModalProps> = ({
  isVisible,
  onClose,
  onAssign,
}) => {
  const { colors, sizes } = useTheme()
  const { getProjetcs } = useApi()
  const { userdata } = useContext(AuthContext)

  // État pour les données (API ou userdata)
  const [arrderoules, setArrderoules] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // États existants
  const [
    selectedArrDeroule,
    setSelectedArrDeroule,
  ] = useState<ArrDeroule | null>(null)
  const [selectedDeroule, setSelectedDeroule] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredArrDeroules, setFilteredArrDeroules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger les données quand la modal s'ouvre
  useEffect(() => {
    if (isVisible) {
      loadData()
    }
  }, [isVisible])

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      const response = await getProjetcs()
      // console.log('Données récupérées:', response.data.newevts)
      setArrderoules(response.data.newevts || [])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      // Fallback sur userdata si l'API échoue
      setArrderoules(userdata?.newevts || [])
    } finally {
      setIsLoadingData(false)
    }
  }

  // Filtrage identique à votre version originale
  useEffect(() => {
    if (arrderoules.length > 0) {
      setFilteredArrDeroules(
        arrderoules.filter((arrDeroule) =>
          arrDeroule.evt.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredArrDeroules([])
    }
  }, [searchQuery, arrderoules])

  const handleSelectArrDeroule = (arrDeroule: any) => {
    setSelectedArrDeroule(arrDeroule)
    setSelectedDeroule(null)
  }

  const handleSelectDeroule = (deroule: any) => {
    setSelectedDeroule(deroule)
  }

  const handleAssign = async () => {
    if (selectedArrDeroule && selectedDeroule) {
      setIsLoading(true)
      try {
        await onAssign(selectedArrDeroule, selectedDeroule)
        onClose()
      } catch (error) {
        console.error("Erreur lors de l'assignation:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClose = () => {
    if (selectedArrDeroule) {
      setSelectedArrDeroule(null)
      setSelectedDeroule(null)
    } else {
      // Reset au close
      setSelectedArrDeroule(null)
      setSelectedDeroule(null)
      setSearchQuery('')
      onClose()
    }
  }

  const renderArrDerouleItem = ({ item }: { item: any }) => {
    const hasArrderoules = item.arrderoules && item.arrderoules.length > 0

    return (
      <TouchableOpacity
        style={[
          styles.item,
          selectedArrDeroule?.idevt === item.idevt && styles.selectedItem,
          !hasArrderoules && styles.disabledItem,
        ]}
        onPress={() => handleSelectArrDeroule(item)}
        disabled={!hasArrderoules}
      >
        <Text style={[styles.title, !hasArrderoules && styles.disabledText]}>
          {item.evt}
        </Text>
        {!hasArrderoules && (
          <Text style={styles.warningText}>Aucun déroulé disponible</Text>
        )}
        {hasArrderoules && (
          <Text style={styles.countText}>
            {item.arrderoules.length} déroulé(s)
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  const renderDerouleItem = ({ item }: { item: any }) => {
    console.log(item)
    return (
      <TouchableOpacity
        style={[
          styles.item,
          selectedDeroule?.id === item.id && styles.selectedItem,
        ]}
        onPress={() => {
          handleSelectDeroule(item)
        }}
      >
        <Text style={styles.title}>{item.titre_deroule}</Text>
        <Text style={styles.subtitle}>Numéro: {item.numero_deroule}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedArrDeroule
              ? 'Sélectionner un déroulé'
              : 'Sélectionner un projet'}
          </Text>

          {isLoadingData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {!selectedArrDeroule ? (
                <FlatList
                  data={filteredArrDeroules}
                  renderItem={renderArrDerouleItem}
                  keyExtractor={(item) => item.idevt}
                  style={styles.list}
                />
              ) : (
                <FlatList
                  data={selectedArrDeroule.arrderoules || []}
                  renderItem={renderDerouleItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>
                        Aucun déroulé disponible pour cet événement
                      </Text>
                    </View>
                  )}
                />
              )}

              {selectedArrDeroule && selectedDeroule && (
                <Button
                  style={[
                    styles.assignButton,
                    { backgroundColor: colors.primary },
                  ]}
                  gradient={GRADIENTS.primary}
                  onPress={handleAssign}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.assignButtonText}>Assigner</Text>
                  )}
                </Button>
              )}
            </>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>
              {selectedArrDeroule ? 'Retour' : 'Fermer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  list: {
    maxHeight: 300,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: '#fafafa',
  },
  selectedItem: {
    backgroundColor: '#e8f4fd',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  assignButton: {
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  assignButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  disabledItem: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  disabledText: {
    color: '#999',
  },
  warningText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  countText: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
  },
})

export default DeroulesModal
