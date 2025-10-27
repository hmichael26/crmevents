import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native'
import { useTheme } from '../hooks'
import Button from './Button'
import { AuthContext } from '../context/AuthContext'
import SelectOption from './SelectOption'
import Icon from 'react-native-vector-icons/Ionicons'
import { CustomDatePicker } from './CustomDatePicker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const { height } = Dimensions.get('window')
const FIELD_HEIGHT = 50

interface DateFieldProps {
  date: string // ✅ String au lieu de Date
  onDateChange: (date: string) => void // ✅ String au lieu de Date
  index: number
}

const DateField: React.FC<DateFieldProps> = ({ date, onDateChange, index }) => {
  const [isPickerVisible, setPickerVisible] = useState(false)
  const { colors } = useTheme()

  const handleDateConfirm = (dateStr: string) => {
    onDateChange(dateStr) // ✅ Directement la string
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={styles.datePickerText}>
          {date || 'Sélectionner une date'}
        </Text>
        <Icon name="calendar-outline" size={20} color={colors.primary} />
      </TouchableOpacity>

      <CustomDatePicker
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleDateConfirm}
        initialDate={date} // ✅ Passer la string directement
        title="Sélectionner une date"
        minDate={new Date(2000, 0, 1)}
        maxDate={new Date(2030, 11, 31)}
      />
    </View>
  )
}

interface FormData {
  fields: {
    type: FieldType
    value: string
  }[]
  timestamp: string
}

interface Option {
  id: string
  libelle: string
}

type FieldType = 'date' | 'text' | 'dynamic'

interface Field {
  type: FieldType
  value: string // ✅ Toujours string maintenant
}

interface Form5Props {
  options: Option[]
  onDataChange: (data: any) => void
  item?: any
}

// ✅ Fonction pour formater n'importe quelle date en DD/MM/YYYY
const formatDateForDisplay = (date: any): string => {
  if (!date) return ''

  try {
    if (typeof date === 'string') {
      // Ignorer les dates invalides
      if (date.startsWith('-') || date.includes('-000001')) {
        return ''
      }

      // Si déjà au format DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date
      }

      // Si format ISO: YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ
      if (date.includes('-')) {
        const datePart = date.includes('T') ? date.split('T')[0] : date
        const parts = datePart.split('-').filter((p) => p)

        if (parts.length === 3) {
          const [year, month, day] = parts.map((p) => p.trim())
          const yearNum = Number(year)

          if (
            year &&
            month &&
            day &&
            yearNum >= 1900 &&
            yearNum <= 2100 &&
            !isNaN(Number(month)) &&
            !isNaN(Number(day))
          ) {
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
          }
        }
      }
    }

    // Si objet Date
    if (date instanceof Date) {
      const year = date.getFullYear()
      if (!isNaN(date.getTime()) && year >= 1900 && year <= 2100) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        return `${day}/${month}/${year}`
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur formatDateForDisplay:', date)
  }

  return ''
}

// ✅ Fonction pour obtenir la date actuelle au format DD/MM/YYYY
const getTodayFormatted = (): string => {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()
  return `${day}/${month}/${year}`
}

const Form5: React.FC<Form5Props> = ({ options, onDataChange, item }) => {
  const { userdata } = useContext(AuthContext)
  const { gradients, colors } = useTheme()

  const determineFieldType = (fieldItem: any): FieldType => {
    if (
      fieldItem.type === 'date' ||
      fieldItem.type === 'text' ||
      fieldItem.type === 'dynamic'
    ) {
      return fieldItem.type
    }

    // Vérifier si la valeur ressemble à une date
    if (
      typeof fieldItem.value === 'string' &&
      (fieldItem.value.match(/^\d{2}\/\d{2}\/\d{4}$/) ||
        fieldItem.value.includes('-'))
    ) {
      return 'date'
    }

    return 'text'
  }

  const [fields, setFields] = useState<Field[]>([])
  const [dynamicOptions, setDynamicOptions] = useState<Option[]>([])

  useEffect(() => {
    if (item && Array.isArray(item) && item.length > 0) {
      const initializedFields = item.map((fieldItem: any) => {
        const fieldType = determineFieldType(fieldItem)

        return {
          type: fieldType,
          value:
            fieldType === 'date'
              ? formatDateForDisplay(fieldItem.value) || getTodayFormatted()
              : fieldItem.value || '',
        }
      })
      setFields(initializedFields)
    }
  }, [item])

  useEffect(() => {
    if (Array.isArray(options) && options.length > 0) {
      setDynamicOptions(options)
    }
  }, [options])

  const onDataChangeRef = React.useRef(onDataChange)

  useEffect(() => {
    onDataChangeRef.current = onDataChange
  }, [onDataChange])

  useEffect(() => {
    const formData = {
      fields: fields.map((field) => ({
        type: field.type,
        value: field.value, // ✅ Toujours string maintenant
      })),
    }
    onDataChangeRef.current(formData)
  }, [fields])

  const addRandomField = (option: number): void => {
    const fieldTypes: FieldType[] = ['date', 'text', 'dynamic']
    const randomType = fieldTypes[option]
    let newField: Field

    switch (randomType) {
      case 'date':
        newField = { type: 'date', value: getTodayFormatted() } // ✅ String
        break
      case 'text':
        newField = { type: 'text', value: '' }
        break
      case 'dynamic':
        if (dynamicOptions.length > 0) {
          newField = {
            type: 'dynamic',
            value: dynamicOptions[0].libelle,
          }
        } else {
          newField = {
            type: 'dynamic',
            value: '',
          }
        }
        break
    }

    setFields([...fields, newField])
  }

  const updateField = (index: number, newValue: string): void => {
    const newFields = [...fields]
    newFields[index].value = newValue // ✅ Toujours string
    setFields(newFields)
  }

  const removeField = (index: number): void => {
    const newFields = [...fields]
    newFields.splice(index, 1)
    setFields(newFields)
  }

  const renderField = (field: Field, index: number) => {
    switch (field.type) {
      case 'date':
        return (
          <View key={index} style={styles.fieldWrapper}>
            <TouchableOpacity
              onPress={() => removeField(index)}
              style={styles.removeButton}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                ×
              </Text>
            </TouchableOpacity>
            <DateField
              date={field.value} // ✅ String
              onDateChange={(newDate) => updateField(index, newDate)} // ✅ String
              index={index}
            />
          </View>
        )
      case 'text':
        return (
          <View key={index} style={styles.fieldWrapper}>
            <TouchableOpacity
              onPress={() => removeField(index)}
              style={styles.removeButton}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                ×
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={field.value}
              onChangeText={(newText: string) => updateField(index, newText)}
              placeholder="Entrer du texte"
              placeholderTextColor="#999"
            />
          </View>
        )
      case 'dynamic':
        return (
          <View key={index} style={styles.dynamicFieldWrapper}>
            <TouchableOpacity
              onPress={() => removeField(index)}
              style={styles.removeButtonDynamic}
            >
              <Text style={[styles.removeText, { color: colors.danger }]}>
                ×
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <SelectOption
                options={dynamicOptions}
                selectedOption={field.value}
                onSelectionChange={(selectedLibelle) =>
                  updateField(index, selectedLibelle)
                }
                placeholder="Sélectionnez une option"
              />
            </View>
          </View>
        )
    }
  }

  return (
    <ScrollView style={styles.container}>
      {(!item || item.length === 0 || fields.length === 0) && (
        <View style={styles.fieldContainer}>
          <Text style={[styles.loadingText, { color: colors.danger }]}>
            Aucun champ ajouté
          </Text>
        </View>
      )}

      {fields &&
        fields.map((field, index) => (
          <View key={index} style={styles.fieldContainer}>
            {renderField(field, index)}
          </View>
        ))}

      <View style={styles.buttonContainer}>
        <Button
          gradient={gradients.secondary}
          style={styles.button}
          onPress={() => addRandomField(0)}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>
              Champ DATE
            </Text>
            <Text style={[styles.buttonText, styles.plusIcon]}>+</Text>
          </View>
        </Button>

        <Button
          gradient={gradients.info}
          style={styles.button}
          onPress={() => addRandomField(1)}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>
              Champ TEXT
            </Text>
            <Text style={[styles.buttonText, styles.plusIcon]}>+</Text>
          </View>
        </Button>

        <Button
          gradient={gradients.success}
          style={styles.button}
          onPress={() => addRandomField(2)}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>
              Champ DYNAMIQUE
            </Text>
            <Text style={[styles.buttonText, styles.plusIcon]}>+</Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginTop: 13,
    marginHorizontal: 10,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 7,
    minHeight: FIELD_HEIGHT + 7,
    backgroundColor: '#fff',
  },
  dynamicFieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 7,
    minHeight: FIELD_HEIGHT + 5,
    backgroundColor: '#fff',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  removeButtonDynamic: {
    paddingRight: 10,
    alignSelf: 'flex-start',
    paddingTop: 5,
  },
  removeText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 28,
  },
  textInput: {
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
    flex: 1,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    paddingVertical: 20,
  },
  buttonContainer: {
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  centerText: {
    textAlign: 'center',
    flex: 1,
  },
  plusIcon: {
    fontSize: 25,
    marginHorizontal: 5,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  datePickerText: {
    fontSize: 16,
    color: '#000',
  },
})

export default Form5
