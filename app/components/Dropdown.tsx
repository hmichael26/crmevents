import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'

type OptionItem = {
  value: string
  label: string
}

interface DropDownProps {
  data: any[]
  onChange: (item: OptionItem) => void
  placeholder: string
  defaultValue?: any
}

export default function Dropdown({
  data,
  onChange,
  placeholder,
  defaultValue,
}: DropDownProps) {
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    if (defaultValue) {
      // Assuming defaultValue is an object like { "7753": "oui", "7754": "non" }
      const firstKey = Object.keys(defaultValue)[0]
      const defaultLabel = defaultValue[firstKey]
      const defaultItem = data.find((item) => item.label === defaultLabel)
      if (defaultItem) {
        setValue(defaultItem.label)
      }
    }
  }, [defaultValue, data])

  const toggleModal = useCallback(() => setExpanded(!expanded), [expanded])

  const onSelect = useCallback(
    (item: OptionItem) => {
      onChange(item)
      setValue(item.label)
      setExpanded(false)
    },
    [onChange],
  )

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={toggleModal}
      >
        <Text style={styles.text}>{value || placeholder}</Text>
        <AntDesign name={expanded ? 'caretup' : 'caretdown'} />
      </TouchableOpacity>

      <Modal visible={expanded} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setExpanded(false)}>
          <View style={styles.backdrop}>
            <View style={styles.modalContainer}>
              <FlatList
                keyExtractor={(item) => item.value}
                data={data}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.optionItem}
                    onPress={() => onSelect(item)}
                  >
                    <Text style={{ textTransform: 'uppercase' }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 0,
  },
  optionItem: {
    height: 40,
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  text: {
    fontSize: 15,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  button: {
    //       justifyContent: "space-between",
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 20,
    // width: "30%",
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,

    borderColor: '#ddd',
  },
})
