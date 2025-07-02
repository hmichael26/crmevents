import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useTheme } from '../hooks'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import Button from './Button'
import { AuthContext } from '../context/AuthContext'

const { height } = Dimensions.get('window')

interface DateFieldProps {
  date: Date
  onDateChange: (date: Date) => void
}

const DateField: React.FC<DateFieldProps> = ({ date, onDateChange }) => {
  const [show, setShow] = useState(false)

  const onChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || date
    setShow(false)
    onDateChange(currentDate)
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', alignContent: 'center' }}>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{ marginTop: 5, marginHorizontal: 5 }}
      >
        <Text style={{ textAlign: 'center', fontSize: 15 }}>
          {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is20Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
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
  value: Date | string
}

interface Form5Props {
  options: Option[]
  onDataChange: (data: any) => void
  item?: any // Made item optional
}

const Form5: React.FC<Form5Props> = ({ options, onDataChange, item }) => {
  const { userdata } = useContext(AuthContext)
  const { gradients, colors } = useTheme()

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date()

    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }

    return new Date(dateStr)
  }

  const determineFieldType = (fieldItem: any): FieldType => {
    if (
      fieldItem.type === 'date' ||
      fieldItem.type === 'text' ||
      fieldItem.type === 'dynamic'
    ) {
      return fieldItem.type
    }

    if (
      typeof fieldItem.value === 'string' &&
      fieldItem.value.match(/^\d{2}\/\d{2}\/\d{4}$/)
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
              ? parseDate(fieldItem.value)
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

  useEffect(() => {
    const formData = {
      fields: fields.map((field) => ({
        type: field.type,
        value:
          field.type === 'date'
            ? (field.value as Date).toLocaleDateString('fr-FR')
            : field.value,
      })),
    }
    onDataChange(formData)
  }, [fields])

  const addRandomField = (option: number): void => {
    const fieldTypes: FieldType[] = ['date', 'text', 'dynamic']
    const randomType = fieldTypes[option]
    let newField: Field

    switch (randomType) {
      case 'date':
        newField = { type: 'date', value: new Date() }
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

  const updateField = (index: number, newValue: Date | string): void => {
    const newFields = [...fields]
    newFields[index].value = newValue
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
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              borderColor: '#ccc',
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              marginHorizontal: 7,
            }}
          >
            <TouchableOpacity onPress={() => removeField(index)}>
              <Text
                style={{
                  fontSize: 20,
                  color: colors.danger,
                  fontWeight: 'bold',
                }}
              >
                X
              </Text>
            </TouchableOpacity>
            <DateField
              date={field.value as Date}
              onDateChange={(newDate) => updateField(index, newDate)}
            />
          </View>
        )
      case 'text':
        return (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              borderColor: '#ccc',
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              marginHorizontal: 7,
            }}
          >
            <TouchableOpacity onPress={() => removeField(index)}>
              <Text
                style={{
                  fontSize: 20,
                  color: colors.danger,
                  fontWeight: 'bold',
                }}
              >
                X
              </Text>
            </TouchableOpacity>
            <TextInput
              style={{
                fontSize: 18,
                color: '#000',
                textAlign: 'center',
                marginLeft: 7,
              }}
              value={field.value as string}
              onChangeText={(newText: string) => updateField(index, newText)}
              placeholder="Enter text"
            />
          </View>
        )
      case 'dynamic':
        return (
          <View
            key={index}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderColor: '#ccc',
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 10,
              marginHorizontal: 7,
            }}
          >
            <TouchableOpacity onPress={() => removeField(index)}>
              <Text
                style={{
                  fontSize: 20,
                  color: colors.danger,
                  fontWeight: 'bold',
                }}
              >
                X
              </Text>
            </TouchableOpacity>
            <Picker
              selectedValue={field.value as string}
              style={[styles.picker, { flex: 1 }]}
              onValueChange={(itemValue) => updateField(index, itemValue)}
            >
              {dynamicOptions.map((option) => (
                <Picker.Item
                  key={option.id}
                  label={option.libelle}
                  value={option.libelle}
                />
              ))}
            </Picker>
          </View>
        )
    }
  }

  return (
    <ScrollView style={styles.container}>
      {(!item || item.length == 0 || fields.length === 0) ?? (
        <View style={styles.fieldContainer}>
          <Text
            style={{ color: colors.danger, fontSize: 20, textAlign: 'center' }}
          >
            chargement ...
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
            <Text
              style={[styles.buttonText, { fontSize: 25, marginHorizontal: 5 }]}
            >
              +
            </Text>
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
            <Text
              style={[styles.buttonText, { fontSize: 25, marginHorizontal: 5 }]}
            >
              +
            </Text>
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
            <Text
              style={[styles.buttonText, { fontSize: 25, marginHorizontal: 5 }]}
            >
              +
            </Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 10,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  picker: {
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  button: {
    marginBottom: 5,
  },
  buttonText: {
    fontWeight: '',
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
})

export default Form5
