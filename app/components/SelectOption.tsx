import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native'

interface Option {
  id: string | number
  libelle: string
}

interface SelectOptionProps {
  options: Option[]
  selectedOption: string // Le libellé sélectionné (pas l'ID)
  onSelectionChange: (libelle: string) => void // Retourne le libellé (pas l'ID)
  placeholder?: string
  disabled?: boolean
}

const SelectOption: React.FC<SelectOptionProps> = ({
  options,
  selectedOption,
  onSelectionChange,
  placeholder = 'Sélectionnez une option',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectOption = (libelle: string) => {
    onSelectionChange(libelle)
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const getSelectedLabel = () => {
    const selected = options.find((option) => option.libelle === selectedOption)
    return selected ? selected.libelle : null
  }

  const renderSelectedOption = () => {
    const selectedLabel = getSelectedLabel()
    if (!selectedLabel) {
      return <Text style={styles.placeholder}>{placeholder}</Text>
    }
    return (
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedText}>{selectedLabel}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selectBox, disabled && styles.selectBoxDisabled]}
        onPress={toggleDropdown}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <View style={styles.contentContainer}>
          {renderSelectedOption()}
          <Text style={[styles.arrow, disabled && styles.arrowDisabled]}>
            {isOpen ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleDropdown}
        >
          <View style={styles.dropdown}>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    selectedOption == option.libelle && styles.selectedOption,
                  ]}
                  onPress={() => selectOption(option.libelle)}
                >
                  <Text style={styles.optionText}>{option.libelle}</Text>
                  {selectedOption == option.libelle && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectBox: {
    paddingHorizontal: 5,

    backgroundColor: '#fff',
  },
  selectBoxDisabled: {},
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    color: '#999',
    flex: 1,
    fontSize: 16,
  },
  selectedContainer: {
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    color: '#000',
  },
  arrow: {
    fontSize: 20,
    marginLeft: 10,
    color: '#000',
  },
  arrowDisabled: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    width: '80%',
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
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  checkmark: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
  },
})

export default SelectOption
