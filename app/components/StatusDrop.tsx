import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native'
import { useApi } from '../context/useApi'

const StatusDropdown = ({
  initialStatus = 'Nouveau',
  onStatusChange,
  itemId,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { updateSelect } = useApi()

  // Liste des statuts disponibles - memoized pour éviter les recréations
  const statusOptions = useMemo(
    () => [
      { id: 1, label: 'A affiner', value: 'a_affiner', color: '#FBCF33' }, // warning
      { id: 2, label: 'Conclu', value: 'conclu', color: '#98EC2D' }, // success
      { id: 3, label: 'Envoyer', value: 'envoyer', color: '#21D4FD' }, // info
      { id: 4, label: 'Hot', value: 'hot', color: '#FF667C' }, // danger
      { id: 5, label: 'Nouveau', value: 'nouveau', color: '#7928CA' }, // primary
      { id: 6, label: 'Perdu', value: 'perdu', color: '#627594' }, // secondary
    ],
    [],
  )

  // Map pour optimiser les recherches
  const statusMap = useMemo(() => {
    const map = new Map()
    statusOptions.forEach((status) => {
      map.set(status.label, status)
      map.set(status.value, status)
    })
    return map
  }, [statusOptions])

  useEffect(() => {
    const foundStatus = statusMap.get(initialStatus)
    setSelectedStatus(foundStatus?.value || 'nouveau')
  }, [initialStatus, statusMap])

  // Fonction pour faire l'appel API - memoized
  const updateStatus = useCallback(
    async (newStatus) => {
      if (!itemId) {
        Alert.alert('Erreur', 'ID manquant pour la mise à jour')
        return
      }

      setIsLoading(true)

      try {
        const response = await updateSelect({
          id: itemId,
          status: newStatus.value,
        })

        if (response?.ok) {
          setSelectedStatus(newStatus.value)
          onStatusChange?.(newStatus, response)
          Alert.alert('Succès', `Statut mis à jour vers: ${newStatus.label}`)
        } else {
          throw new Error('Erreur lors de la mise à jour')
        }
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de mettre à jour le statut')
        console.error('Erreur API:', error)
      } finally {
        setIsLoading(false)
        setIsDropdownOpen(false)
      }
    },
    [itemId, updateSelect, onStatusChange],
  )

  const handleStatusSelect = useCallback(
    (status) => {
      if (status.value !== selectedStatus) {
        updateStatus(status)
      } else {
        setIsDropdownOpen(false)
      }
    },
    [selectedStatus, updateStatus],
  )

  const getCurrentStatusColor = useCallback(() => {
    const currentStatus = statusMap.get(selectedStatus)
    return currentStatus?.color || '#6C757D'
  }, [selectedStatus, statusMap])

  const getCurrentStatusLabel = useCallback(() => {
    const currentStatus = statusMap.get(selectedStatus)
    return currentStatus?.label || 'Nouveau'
  }, [selectedStatus, statusMap])

  const renderStatusItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[
          styles.dropdownItem,
          item.value === selectedStatus && styles.selectedItem,
        ]}
        onPress={() => handleStatusSelect(item)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.statusIndicator, { backgroundColor: item.color }]}
        />
        <Text
          style={[
            styles.dropdownItemText,
            item.value === selectedStatus && styles.selectedItemText,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    ),
    [selectedStatus, handleStatusSelect],
  )

  const keyExtractor = useCallback((item) => item.id.toString(), [])

  const closeModal = useCallback(() => setIsDropdownOpen(false), [])

  const openDropdown = useCallback(() => {
    if (!isLoading) {
      setIsDropdownOpen(true)
    }
  }, [isLoading])

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.statusContainer,
          isLoading && styles.statusContainerDisabled,
        ]}
        onPress={openDropdown}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.statusText}>
          STATUT :{' '}
          {isLoading ? 'MISE À JOUR...' : getCurrentStatusLabel().toUpperCase()}
        </Text>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getCurrentStatusColor() },
          ]}
        />
      </TouchableOpacity>

      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.dropdownList}>
            <FlatList
              data={statusOptions}
              renderItem={renderStatusItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    // paddingVertical: 14,
    minHeight: 50,
  },
  statusContainerDisabled: {
    opacity: 0.6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.5,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 200,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: '#F0F8FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    fontWeight: '600',
  },
  selectedItemText: {
    fontWeight: '700',
    color: '#007AFF',
  },
})

export default StatusDropdown
