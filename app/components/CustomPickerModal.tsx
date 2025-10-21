import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

export const CustomPickerModal = React.memo(
  ({
    visible,
    onClose,
    items = [],
    onSelect,
    title = 'Sélectionner',
    loading = false,
    searchable = true,
    placeholder = 'Rechercher...',
    emptyText = 'Aucun résultat trouvé',
    resetText = 'Aucune sélection',
  }) => {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredItems = useMemo(() => {
      if (!searchQuery) return items
      return items.filter((item) =>
        (item.name || item.libelle)
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    }, [items, searchQuery])

    const handleClose = () => {
      setSearchQuery('')
      onClose()
    }

    const handleSelect = (value) => {
      onSelect(value)
      setSearchQuery('')
      onClose()
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleClose}
          />

          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            {searchable && !loading && (
              <View style={styles.modalSearchContainer}>
                <Icon name="search" size={20} color="#999" />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={placeholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Loading */}
            {loading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color="#9932CC" size="large" />
                <Text style={styles.modalLoadingText}>Chargement...</Text>
              </View>
            ) : (
              <>
                {/* Reset option */}
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelect('')}
                >
                  <Text style={styles.modalItemTextReset}>{resetText}</Text>
                </TouchableOpacity>

                <View style={styles.modalSeparator} />

                {/* Items list */}
                <FlatList
                  data={filteredItems}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleSelect(item.id)}
                    >
                      <Text style={styles.modalItemText}>
                        {item.name || item.libelle}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.modalSeparator} />
                  )}
                  ListEmptyComponent={
                    <Text style={styles.modalEmptyText}>{emptyText}</Text>
                  }
                  showsVerticalScrollIndicator={true}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    )
  },
)

export const CustomSelector = React.memo(
  ({
    value,
    onPress,
    placeholder = 'Sélectionner',
    disabled = false,
    items = [],
    style,
  }) => {
    const selectedItem = items.find((item) => item.id === value)
    const displayText = selectedItem
      ? selectedItem.name || selectedItem.libelle
      : placeholder

    return (
      <TouchableOpacity
        style={[
          styles.selectorContainer,
          disabled && styles.selectorDisabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedItem && styles.selectorPlaceholder,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Icon
          name="chevron-down"
          size={20}
          color={disabled ? '#ccc' : '#9932CC'}
        />
      </TouchableOpacity>
    )
  },
)

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,

    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalSearchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemTextReset: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  modalLoadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  modalEmptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 40,
    fontSize: 16,
  },

  // Selector styles
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
    minHeight: 45,
  },
  selectorDisabled: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  selectorPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
})

CustomPickerModal.displayName = 'CustomPickerModal'
CustomSelector.displayName = 'CustomSelector'
