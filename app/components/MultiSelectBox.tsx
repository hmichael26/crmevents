import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';

interface Option {
    id: string;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selectedOptions: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    selectedOptions,
    onSelectionChange,
    placeholder = "Sélectionnez des options"
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (id: string) => {
        const updatedSelection = selectedOptions.includes(id)
            ? selectedOptions.filter(optionId => optionId !== id)
            : [...selectedOptions, id];
        onSelectionChange(updatedSelection);
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    const renderSelectedOptions = () => {
        if (selectedOptions.length === 0) {
          return <Text style={styles.placeholder}>{placeholder}</Text>;
        }
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedContainer}>
              {options
                .filter(option => selectedOptions.includes(option.id))
                .map(option => (
                  <View key={option.id} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>{option.label}</Text>
                  </View>
                ))}
            </View>
          </ScrollView>
        );
      };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.selectBox} onPress={toggleDropdown}>
                {renderSelectedOptions()}
                <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <Modal visible={isOpen} transparent={true} animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={toggleDropdown}
                >
                    <View style={styles.dropdown}>
                        <ScrollView>
                            {options.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.option,
                                        selectedOptions.includes(option.id) && styles.selectedOption
                                    ]}
                                    onPress={() => toggleOption(option.id)}
                                >
                                    <Text style={styles.optionText}>{option.label}</Text>
                                    {selectedOptions.includes(option.id) && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 5,
    },
    selectBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    placeholder: {
        color: '#999',
    },
    selectedText: {
        flex: 1,

    },
    arrow: {
        fontSize: 20,
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
    },
    option: {
        padding: 10,
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
    },
    checkmark: {
        color: 'green',
        fontWeight: 'bold',
    }, selectBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 50, // Ajout d'une hauteur minimale
      },
      selectedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
      },
      selectedTag: {
        backgroundColor: '#e1e1e1',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 5,
        marginBottom: 5,
      },
      selectedTagText: {
        fontSize: 14,
      },
    
});

export default MultiSelect;