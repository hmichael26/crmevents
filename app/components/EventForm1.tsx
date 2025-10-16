import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native'
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon'
import MultiSelect from './MultiSelectBox'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from 'react-native-vector-icons/Ionicons'
import { CustomDatePicker } from './CustomDatePicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

// Fonction helper pour formater les dates en DD/MM/YYYY
const formatDateForDisplay = (date: any): string => {
  if (!date) return ''

  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  if (typeof date === 'string') {
    const parsedDate = new Date(date)
    if (!isNaN(parsedDate.getTime())) {
      const day = String(parsedDate.getDate()).padStart(2, '0')
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
      const year = parsedDate.getFullYear()
      return `${day}/${month}/${year}`
    }
  }

  return ''
}

// Fonction helper pour parser les dates
const parseDate = (date?: Date | string): Date | null => {
  if (!date) return null

  if (date instanceof Date) return date

  if (typeof date === 'string') {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  return null
}

// Fonction helper pour parser une date depuis DD/MM/YYYY
const parseDateFromString = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map((num) => parseInt(num, 10))
  return new Date(year, month - 1, day)
}

// Fonction helper pour parser les IDs sélectionnés
const parseSelectedIds = (typesEvts: string | null | undefined): string[] => {
  if (!typesEvts) return []

  return typesEvts
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '')
}

const Form1: React.FC<Form1Props> = ({ item, eventTypes, onDataChange }) => {
  const insets = useSafeAreaInsets()

  // Initialisation du state avec gestion propre des dates
  const [formData, setFormData] = useState<FormData>({
    idevt: item.idevt || 0,
    evt: item.evt || '',
    date_reception: parseDate(item.date_reception),
    ref: item.ref || '',
    pax: item.pax || '',
    zone: item.zone || '',
    types_evts: Array.isArray(item?.types_evts)
      ? item.types_evts
      : item.types_evts
      ? parseSelectedIds(item?.types_evts)
      : [],
    date_deb: parseDate(item.date_deb),
    date_fin: parseDate(item.date_fin),
    flexible_dates: item.flexible_dates || false,
    budget: item.budget || '',
    commentaires_dates: item.commentaires_dates || '',
    format: item.format || '',
  })

  // États pour gérer les DatePickers
  const [showDateReception, setShowDateReception] = useState(false)
  const [showDateDeb, setShowDateDeb] = useState(false)
  const [showDateFin, setShowDateFin] = useState(false)

  // Effect pour notifier les changements au parent
  useEffect(() => {
    onDataChange(formData, 'form1')
  }, [formData])

  // Fonction pour mettre à jour un champ
  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Gestion des sélections multiples
  const handleSelectionChange = (selectedIds: string[]) => {
    updateFormField('types_evts', selectedIds)
  }

  // Préparation des options pour MultiSelect
  const options = Array.isArray(eventTypes)
    ? eventTypes.map((item) => ({ id: item.id, label: item.libelle }))
    : eventTypes
    ? [{ id: eventTypes.id, label: eventTypes.libelle }]
    : []

  // Handlers pour les DatePickers
  const handleDateReceptionConfirm = (dateStr: string) => {
    const date = parseDateFromString(dateStr)
    updateFormField('date_reception', date)
  }

  const handleDateDebConfirm = (dateStr: string) => {
    const date = parseDateFromString(dateStr)
    updateFormField('date_deb', date)
  }

  const handleDateFinConfirm = (dateStr: string) => {
    const date = parseDateFromString(dateStr)
    updateFormField('date_fin', date)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={'padding'}
      keyboardVerticalOffset={insets.top}
    >
      <View style={styles.container}>
        {/* Titre de l'événement */}
        <TextInput
          placeholder="Titre de l'Event"
          value={formData.evt}
          onChangeText={(text) => updateFormField('evt', text)}
          style={styles.titleInput}
          placeholderTextColor={'#999'}
        />

        {/* Date de création et référence */}
        <View style={styles.inputContainer}>
          <View
            style={[
              formData.idevt != 0 ? { width: '50%' } : { width: '100%' },
              { marginBottom: 12 },
            ]}
          >
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDateReception(true)}
            >
              <Icon name="calendar" size={20} color="#666" />
              <Text style={styles.datePickerText}>
                {formData.date_reception
                  ? formatDateForDisplay(formData.date_reception)
                  : 'Date de réception'}
              </Text>
            </TouchableOpacity>

            <CustomDatePicker
              visible={showDateReception}
              onClose={() => setShowDateReception(false)}
              onConfirm={handleDateReceptionConfirm}
              initialDate={formatDateForDisplay(formData.date_reception)}
              title="Date de réception"
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2030, 11, 31)}
            />
          </View>

          {formData.idevt != 0 && (
            <TextInputWithIcon
              placeholder="REF Projet"
              style={{ width: '50%', height: 40 }}
              value={formData.ref}
              onChangeText={(text) => updateFormField('ref', text)}
              editable={false}
              selectTextOnFocus={false}
              pointerEvents="none"
            />
          )}
        </View>

        {/* Pax et Zone géographique */}
        <View style={styles.inputContainer}>
          <TextInputWithIcon
            iconName="person"
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

        {/* Sélection multiple des types d'événements */}
        <View>
          <MultiSelect
            options={options}
            selectedOptions={formData.types_evts}
            onSelectionChange={handleSelectionChange}
          />
        </View>

        {/* Dates de début et fin */}
        <View style={styles.inputContainer}>
          <View style={{ width: '50%', marginBottom: 10 }}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDateDeb(true)}
            >
              <Icon name="calendar" size={20} color="#666" />
              <Text style={styles.datePickerText}>
                {formData.date_deb
                  ? formatDateForDisplay(formData.date_deb)
                  : 'Date début'}
              </Text>
            </TouchableOpacity>

            <CustomDatePicker
              visible={showDateDeb}
              onClose={() => setShowDateDeb(false)}
              onConfirm={handleDateDebConfirm}
              initialDate={formatDateForDisplay(formData.date_deb)}
              title="Date de début"
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2030, 11, 31)}
            />
          </View>

          <View style={{ width: '50%', marginBottom: 10 }}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDateFin(true)}
            >
              <Icon name="calendar" size={20} color="#666" />
              <Text style={styles.datePickerText}>
                {formData.date_fin
                  ? formatDateForDisplay(formData.date_fin)
                  : 'Date fin'}
              </Text>
            </TouchableOpacity>

            <CustomDatePicker
              visible={showDateFin}
              onClose={() => setShowDateFin(false)}
              onConfirm={handleDateFinConfirm}
              initialDate={formatDateForDisplay(formData.date_fin)}
              title="Date de fin"
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2030, 11, 31)}
            />
          </View>
        </View>

        {/* Switch dates flexibles et Budget */}
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
        </View>

        {/* Commentaire pour le prestataire */}
        <TextInput
          placeholder="Commentaire pour le prestataire"
          multiline
          numberOfLines={4}
          style={[styles.textArea, styles.textInput]}
          value={formData.commentaires_dates}
          onChangeText={(text) => updateFormField('commentaires_dates', text)}
          placeholderTextColor={'#999'}
        />

        {/* Commentaire personnel */}
        <TextInput
          placeholder="Commentaire Personnel"
          multiline
          numberOfLines={4}
          style={[styles.textArea, styles.textInput]}
          value={formData.format}
          onChangeText={(text) => updateFormField('format', text)}
          placeholderTextColor={'#999'}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1,
  },
  titleInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 13,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    gap: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  textInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 13,
    backgroundColor: '#fff',
  },
})

export default Form1
