import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native'
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon'
import MultiSelect from './MultiSelectBox'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { Datepicker, Layout, Text, IconElement } from '@ui-kitten/components'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Input from './Input'
import Icon from 'react-native-vector-icons/Ionicons'

const { width, height } = Dimensions.get('window')
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

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

// Fonction helper pour formater les dates d'affichage
const formatDateForDisplay = (date: any): string => {
  if (!date) return '' // Retourne une chaîne vide si pas de date

  if (date instanceof Date) {
    return date.toLocaleDateString()
  }

  // Si c'est une string, essaie de la parser
  if (typeof date === 'string') {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleDateString()
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

// Fonction helper pour parser les IDs sélectionnés
const parseSelectedIds = (typesEvts: string | null | undefined): string[] => {
  if (!typesEvts) return []

  return typesEvts
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '')
}

const Form1: React.FC<Form1Props> = ({ item, eventTypes, onDataChange }) => {
  //console.log(item)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

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

  // États pour le DateTimePicker
  const [show, setShow] = useState(false)
  const [currentDatePicker, setCurrentDatePicker] = useState<
    'date_reception' | 'date_deb' | 'date_fin'
  >('date_reception')

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

  // Gestion du changement de date
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(false)

    if (selectedDate) {
      updateFormField(currentDatePicker, selectedDate)
    }
  }

  // Affichage du DateTimePicker
  const showDatepicker = (
    datePickerType: 'date_reception' | 'date_deb' | 'date_fin',
  ) => {
    setCurrentDatePicker(datePickerType)
    setShow(true)
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

  // Fonction pour obtenir la date actuelle pour le DateTimePicker
  const getCurrentPickerDate = (): Date => {
    let currentDate: Date | null = null

    switch (currentDatePicker) {
      case 'date_reception':
        currentDate = formData.date_reception
        break
      case 'date_deb':
        currentDate = formData.date_deb
        break
      case 'date_fin':
        currentDate = formData.date_fin
        break
    }

    return currentDate instanceof Date ? currentDate : new Date()
  }

  // console.log(formData.idevt, item)
  const insets = useSafeAreaInsets()

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
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 40,

            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            paddingHorizontal: 10,
            marginBottom: 13,
          }}
          placeholderTextColor={'#000'}
        />

        {/* Date de création et référence */}
        <View style={styles.inputContainer}>
          <View
            style={[
              formData.idevt != 0 ? { width: '50%' } : { width: '100%' },
              {
                marginBottom: 12,
                height: 40,
              },
            ]}
          >
            <Datepicker
              placeholder="Sélectionner une date"
              style={{
                width: '100%',
              }}
              min={new Date(2000, 0, 1)} // 🆕 Date minimale
              max={new Date(2030, 11, 31)} // 🆕 Date maximale
              controlStyle={{
                backgroundColor: '#fff',

                borderColor: '#ccc',
                borderWidth: 1,
              }}
              size="medium"
              status="primary"
              accessoryLeft={
                <Icon
                  name="calendar"
                  size={20}
                  color="#ccc"
                  style={{ marginRight: 10 }}
                />
              }
              backdropStyle={{ backgroundColor: 'transparent', opacity: 0.3 }}
              date={formData.date_reception}
              onSelect={(nextDate) =>
                updateFormField('date_reception', nextDate)
              }
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
            <Datepicker
              placeholder="Date début"
              style={{
                width: '100%',
              }}
              min={new Date(2000, 0, 1)} // 🆕 Date minimale
              max={new Date(2030, 11, 31)} // 🆕 Date maximale
              controlStyle={{
                backgroundColor: '#fff',

                borderColor: '#ccc',
                borderWidth: 1,
              }}
              size="medium"
              status="primary"
              accessoryLeft={
                <Icon
                  name="calendar"
                  size={20}
                  color="#ccc"
                  style={{ marginRight: 10 }}
                />
              }
              date={formData.date_deb}
              onSelect={(nextDate) => updateFormField('date_deb', nextDate)}
            />
          </View>
          <View style={{ width: '50%', marginBottom: 10 }}>
            <Datepicker
              placeholder="Date fin"
              style={{
                width: '100%',
              }}
              min={new Date(2000, 0, 1)} // 🆕 Date minimale
              max={new Date(2030, 11, 31)} // 🆕 Date maximale
              controlStyle={{
                backgroundColor: '#fff',

                borderColor: '#ccc',
                borderWidth: 1,
              }}
              size="medium"
              status="primary"
              accessoryLeft={
                <Icon
                  name="calendar"
                  size={20}
                  color="#ccc"
                  style={{ marginRight: 10 }}
                />
              }
              date={formData.date_fin}
              onSelect={(nextDate) => updateFormField('date_fin', nextDate)}
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
          placeholderTextColor={'#000'}
        />
        {/* Commentaire personnel */}
        <TextInput
          placeholder="Commentaire Personnel"
          multiline
          numberOfLines={4}
          style={[styles.textArea, styles.textInput]}
          value={formData.format}
          onChangeText={(text) => updateFormField('format', text)}
          placeholderTextColor={'#000'}
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
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    gap: 4,
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 2,
  },
  textInput: {
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 13,
  },
})

export default Form1
