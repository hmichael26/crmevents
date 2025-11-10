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
import { useToast } from '../components/ToastComponent'

const StatusDropdown = ({
  initialStatus = 'Nouveau',
  onStatusChange,
  itemId,
}) => {
  console.log('initialStatus', initialStatus)
  const { showToast, ToastComponent } = useToast()

  const [selectedStatus, setSelectedStatus] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { updateSelect } = useApi()

  // Liste des statuts disponibles - memoized pour éviter les recréations
  const statusOptions = useMemo(
    () => [
      {
        id: 5,
        label: 'Nouveau',
        value: 'Nouveau',
        color: '#03a9f5',
        name: 'Nouveau Projet',
      },
      {
        id: 7,
        label: 'A valider',
        value: 'a_valider',
        color: '#404fe9',
        name: 'Devis à Valider',
      },
      {
        id: 1,
        label: 'A affiner',
        value: 'a_affiner',
        color: '#4f37da',
        name: 'Recherche à Affiner',
      },
      {
        id: 3,
        label: 'Envoyé',
        value: 'Envoyer',
        color: '#690ec2',
        name: 'Devis Envoyé',
      },
      { id: 4, label: 'Hot', value: 'Hot', color: '#f025b6', name: 'HOT' },
      {
        id: 6,
        label: 'Gagnés',
        value: 'Conclu',
        color: 'green',
        name: ' Projets Gagnés',
      },
      {
        id: 8,
        label: 'Perdus',
        value: 'Perdu',
        color: '#f025b6',
        name: 'Projets Perdus',
      },
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
          id_evt: itemId,
          statut: newStatus.value,
        })

        console.log(response)

        if (response?.code == 'SUCCESS') {
          setSelectedStatus(newStatus.value)
          onStatusChange?.(newStatus, response)
          showToast('✅ Statut mis à jour vers: ' + newStatus.label, 'success')
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
    fontSize: 15,
    fontWeight: '500',
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
    maxHeight: 400,
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
    fontSize: 15,
    color: '#333333',
    marginLeft: 12,
    fontWeight: '400',
  },
  selectedItemText: {
    fontWeight: '700',
    color: '#007AFF',
  },
})

export default StatusDropdown
