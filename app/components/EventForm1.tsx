import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon'
import MultiSelect from './MultiSelectBox'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'

const { width, height } = Dimensions.get('window')

type EventType = {
  id: string
  libelle: string
}

type FormData = {
  idevt?: Number
  evt?: string
  date_reception?: any
  ref?: string
  pax?: string
  zone?: string
  types_evts?: any
  date_deb?: any
  date_fin?: any
  flexible_dates?: boolean
  budget?: string
  commentaires_dates?: string
  format?: string
}

type Form1Props = {
  item: any
  eventTypes: EventType[] | EventType
  onDataChange: (data: FormData, type: string) => void
}

// Helper function to convert date-like input to Date object
const parseDate = (date?: Date | string): Date => {
  if (date instanceof Date) return date
  if (typeof date === 'string') {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate
  }
  return new Date()
}

const Form1: React.FC<Form1Props> = ({ item, eventTypes, onDataChange }) => {
  const parseSelectedIds = (typesEvts: string | null | undefined): string[] => {
    // Cas null ou undefined
    if (!typesEvts) return []

    return typesEvts
      .split(',') // Sépare les éléments par la virgule
      .map((id) => id.trim()) // Enlève les espaces autour de chaque élément
      .filter((id) => id !== '') // Supprime les éléments vides
  }

  const [formData, setFormData] = useState<FormData>({
    idevt: item.idevt || '',
    evt: item.evt || '',
    date_reception:
      item.date_reception instanceof Date
        ? item.date_reception // Si c'est déjà une date, utilise-la
        : item.date_reception
        ? parseDate(item.date_reception) // Sinon, applique le parsing
        : null, // Si aucune date, retourne null

    ref: item.ref || '',
    pax: item.pax || '',
    zone: item.zone || '',
    types_evts: Array.isArray(item?.types_evts)
      ? item.types_evts // Si c'est déjà un tableau, utilise-le directement
      : item.types_evts
      ? parseSelectedIds(item?.types_evts) // Sinon, applique le parsing
      : [],
    date_deb:
      item.date_deb instanceof Date
        ? item.date_deb // Si c'est déjà une date, utilise-la
        : item.date_deb
        ? parseDate(item.date_deb) // Sinon, applique le parsing
        : null,
    date_fin:
      item.date_fin instanceof Date
        ? item.date_fin // Si c'est déjà une date, utilise-la
        : item.date_fin
        ? parseDate(item.date_fin) // Sinon, applique le parsing
        : null,
    flexible_dates: item.flexible_dates || false,
    budget: item.budget || '',
    commentaires_dates: item.commentaires_dates || '',
    format: item.format || '',
  })

  //console.log(formData.types_evts,item.types_evts.split(','),eventTypes)
  const [show, setShow] = useState(false)
  const [currentDatePicker, setCurrentDatePicker] = useState<
    'date_reception' | 'date_deb' | 'date_fin'
  >('date_reception')

  useEffect(() => {
    onDataChange(formData, 'form1')
  }, [formData])

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date()
    setShow(false)

    switch (currentDatePicker) {
      case 'date_reception':
        updateFormField('date_reception', currentDate)
        break
      case 'date_deb':
        updateFormField('date_deb', currentDate)
        break
      case 'date_fin':
        updateFormField('date_fin', currentDate)
        break
    }
  }

  const showDatepicker = (
    datePickerType: 'date_reception' | 'date_deb' | 'date_fin',
  ) => {
    setCurrentDatePicker(datePickerType)
    setShow(true)
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    updateFormField('types_evts', selectedIds)
  }

  const options = Array.isArray(eventTypes)
    ? eventTypes.map((item) => ({ id: item.id, label: item.libelle }))
    : eventTypes
    ? [{ id: eventTypes.id, label: eventTypes.libelle }]
    : []

  return (
    <View style={styles.container}>
      <TextInputWithIcon
        placeholder="Titre de l'Event"
        value={formData.evt}
        onChangeText={(text) => updateFormField('evt', text)}
      />

      <View style={styles.inputContainer}>
        <TextInputWithIcon
          iconName="calendar"
          placeholder="Date de creation"
          editable={false}
          value={
            formData.date_reception instanceof Date
              ? formData.date_reception.toLocaleDateString()
              : new Date(formData.date_reception).toLocaleDateString()
          }
          style={{ width: '50%' }}
          onPress={() => showDatepicker('date_reception')}
        />

        <TextInputWithIcon
          placeholder="REF Projet : 931"
          style={{ width: '50%' }}
          value={formData.ref}
          onChangeText={(text) => updateFormField('ref', text)}
          editable={false}
          selectTextOnFocus={false}
          pointerEvents="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInputWithIcon
          iconName="mail"
          placeholder="Pax"
          style={{ width: '30%' }}
          value={formData.pax}
          onChangeText={(text) => updateFormField('pax', text)}
        />

        <TextInputWithIcon
          placeholder="Zone geographique"
          style={{ width: '70%' }}
          value={formData.zone}
          onChangeText={(text) => updateFormField('zone', text)}
        />
      </View>
      <View>
        <MultiSelect
          options={options}
          selectedOptions={formData.types_evts}
          onSelectionChange={handleSelectionChange}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInputWithIcon
          iconName="calendar"
          placeholder="Début"
          editable={false}
          value={
            formData.date_deb instanceof Date
              ? formData.date_deb.toLocaleDateString()
              : new Date(formData.date_deb).toLocaleDateString()
          }
          style={{ width: '50%' }}
          onPress={() => showDatepicker('date_deb')}
        />
        <TextInputWithIcon
          iconName="calendar"
          placeholder="Fin"
          editable={false}
          value={
            formData.date_fin instanceof Date
              ? formData.date_fin.toLocaleDateString()
              : new Date(formData.date_fin).toLocaleDateString()
          }
          style={{ width: '50%' }}
          onPress={() => showDatepicker('date_fin')}
        />
      </View>
      <View style={styles.inputContainer}>
        <SwitchTextBox
          label="Dates flexibles"
          placeholder="Flexibilite"
          style={{ width: '60%' }}
          toogleValue={formData.flexible_dates}
          onToggle={(value) => updateFormField('flexible_dates', value)}
        />
        <TextInputWithIcon
          fonsiName="euro"
          placeholder="Budget"
          style={{ width: '40%' }}
          value={formData.budget}
          onChangeText={(text) => updateFormField('budget', text)}
        />

        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={
              currentDatePicker === 'date_reception'
                ? formData.date_reception instanceof Date
                  ? formData.date_reception
                  : new Date(formData.date_reception)
                : currentDatePicker === 'date_deb'
                ? formData.date_deb instanceof Date
                  ? formData.date_deb
                  : new Date(formData.date_deb)
                : formData.date_fin instanceof Date
                ? formData.date_fin
                : new Date(formData.date_fin)
            }
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onChange}
          />
        )}
      </View>

      <TextInputWithIcon
        placeholder="Commentaire pour le prestataire"
        multiline
        numberOfLines={4}
        style={{
          height: 100,
          borderColor: '#ccc',
          borderWidth: 2,
        }}
        value={formData.commentaires_dates}
        onChangeText={(text) => updateFormField('commentaires_dates', text)}
      />

      <TextInputWithIcon
        placeholder="Commentaire Personnel"
        multiline
        numberOfLines={4}
        style={{
          height: 100,
          borderColor: '#ccc',
          borderWidth: 2,
        }}
        value={formData.format}
        onChangeText={(text) => updateFormField('format', text)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    gap: 4,
  },
})

export default Form1
