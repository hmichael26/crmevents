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

interface Deroule {
  id: string
  titre_deroule: string
  numero_deroule: string
}

interface ArrDeroule {
  id: string
  titre: string
  deroules: Deroule[]
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
  const { userdata } = useContext(AuthContext)
  const arrderoules = userdata?.newevts || []

  const [
    selectedArrDeroule,
    setSelectedArrDeroule,
  ] = useState<ArrDeroule | null>(null)
  const [selectedDeroule, setSelectedDeroule] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredArrDeroules, setFilteredArrDeroules] = useState<any[]>(
    arrderoules,
  )

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (arrderoules.length > 0) {
      setFilteredArrDeroules(
        arrderoules.filter((arrDeroule) =>
          arrDeroule.evt.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
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

  const renderArrDerouleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedArrDeroule?.id === item.id && styles.selectedItem,
      ]}
      onPress={() => handleSelectArrDeroule(item)}
    >
      <Text style={styles.title}>{item.evt}</Text>
    </TouchableOpacity>
  )

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
              : 'Sélectionner un groupe de déroulés'}
          </Text>

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
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          ) : (
            <FlatList
              data={selectedArrDeroule.arrderoules}
              renderItem={renderDerouleItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          )}

          {selectedArrDeroule && selectedDeroule && (
            <Button
              style={[styles.assignButton, { backgroundColor: colors.primary }]}
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

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              if (selectedArrDeroule) {
                setSelectedArrDeroule(null)
                setSelectedDeroule(null)
              } else {
                onClose()
              }
            }}
          >
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
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#e6e6e6',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  assignButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  assignButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'red',
  },
})

export default DeroulesModal
