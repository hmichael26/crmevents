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
import { useTranslation } from 'react-i18next'

const { width, height } = Dimensions.get('window')

type EventType = {
  id: string
  libelle: string
}

type FormData = {
  idevt?: Number
  evt?: string
  date_reception?: string // ✅ String
  ref?: string
  pax?: string
  zone?: string
  types_evts?: any
  date_deb?: string // ✅ String
  date_fin?: string // ✅ String
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

// ✅ Fonction UNIQUE pour convertir n'importe quel format en DD/MM/YYYY
const formatDateForDisplay = (date: any): string => {
  if (!date) return ''

  try {
    // Si c'est déjà au format DD/MM/YYYY valide
    if (typeof date === 'string') {
      // ✅ Filtrer les dates avec année négative ou invalide
      if (date.startsWith('-') || date.includes('-000001')) {
        console.warn('⚠️ Date invalide ignorée:', date)
        return ''
      }

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date
      }

      // Si format ISO: YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ
      if (date.includes('-')) {
        const datePart = date.includes('T') ? date.split('T')[0] : date
        const parts = datePart.split('-').filter((p) => p) // Enlever les parties vides

        if (parts.length === 3) {
          const year = parts[0]?.trim()
          const month = parts[1]?.trim()
          const day = parts[2]?.trim()

          // ✅ Vérifier que l'année est valide (entre 1900 et 2100)
          const yearNum = Number(year)
          if (
            year &&
            month &&
            day &&
            !isNaN(yearNum) &&
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

    // Si c'est un objet Date valide
    if (date instanceof Date) {
      const year = date.getFullYear()
      // ✅ Vérifier que la date est valide
      if (!isNaN(date.getTime()) && year >= 1900 && year <= 2100) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        return `${day}/${month}/${year}`
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur formatDateForDisplay:', error)
    console.warn('   Date reçue:', date, 'Type:', typeof date)
  }

  return ''
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
  const { t } = useTranslation()

  // ✅ Initialisation avec conversion en string une seule fois
  const [formData, setFormData] = useState<FormData>({
    idevt: item.idevt || 0,
    evt: item.evt || '',
    date_reception: formatDateForDisplay(item.date_reception),
    ref: item.ref || '',
    pax: item.pax || '',
    zone: item.zone || '',
    types_evts: Array.isArray(item?.types_evts)
      ? item.types_evts
      : item.types_evts
      ? parseSelectedIds(item?.types_evts)
      : [],
    date_deb: formatDateForDisplay(item.date_deb),
    date_fin: formatDateForDisplay(item.date_fin),
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

  // ✅ Handlers simplifiés - juste stocker la string DD/MM/YYYY
  const handleDateReceptionConfirm = (dateStr: string) => {
    updateFormField('date_reception', dateStr)
  }

  const handleDateDebConfirm = (dateStr: string) => {
    updateFormField('date_deb', dateStr)
  }

  const handleDateFinConfirm = (dateStr: string) => {
    updateFormField('date_fin', dateStr)
  }

  // console.log('📅 Date reception (string):', formData.date_reception)

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      extraScrollHeight={20} // Espace supplémentaire
      keyboardShouldPersistTaps="handled" // Clic en dehors ferme clavier
      enableAutomaticScroll={true} // Scroll automatique
      enableResetScrollToCoords={true} // Reset après fermeture clavier
    >
      <View style={styles.container}>
        {/* Titre de l'événement */}
        <TextInput
          placeholder={t('details.form.eventName')}
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
                {formData.date_reception || t('details.form.receptionDate')}
              </Text>
            </TouchableOpacity>

            <CustomDatePicker
              visible={showDateReception}
              onClose={() => setShowDateReception(false)}
              onConfirm={handleDateReceptionConfirm}
              initialDate={formData.date_reception}
              title={t('details.form.receptionDate')}
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2030, 11, 31)}
            />
          </View>

          {formData.idevt != 0 && (
            <TextInputWithIcon
              placeholder={t('details.form.ref')}
              style={{ width: '50%', height: 40, backgroundColor: '#ccc4' }}
              value={t('details.form.ref') + ' : ' + formData.ref}
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
            placeholder={t('details.form.pax')}
            style={{ width: '30%' }}
            value={formData.pax}
            onChangeText={(text) => updateFormField('pax', text)}
          />

          <TextInputWithIcon
            iconName="map"
            placeholder={t('details.form.zone')}
            style={{ width: '70%' }}
            value={formData.zone}
            onChangeText={(text) => updateFormField('zone', text)}
          />
        </View>

        {/* Sélection multiple des types d'événements */}
        <View>
          <MultiSelect
            placeholder={t('details.form.eventType')}
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
                {formData.date_deb || t('details.form.startDate')}
              </Text>
            </TouchableOpacity>

            <CustomDatePicker
              visible={showDateDeb}
              onClose={() => setShowDateDeb(false)}
              onConfirm={handleDateDebConfirm}
              initialDate={formData.date_deb}
              title={t('details.form.startDate')}
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
                {formData.date_fin || t('details.form.endDate')}
              </Text>
            </TouchableOpacity>

            <CustomDatePicker
              visible={showDateFin}
              onClose={() => setShowDateFin(false)}
              onConfirm={handleDateFinConfirm}
              initialDate={formData.date_fin}
              title={t('details.form.endDate')}
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2030, 11, 31)}
            />
          </View>
        </View>

        {/* Switch dates flexibles et Budget */}
        <View style={styles.inputContainer}>
          <SwitchTextBox
            label={t('details.form.flexibleDates')}
            placeholder={t('details.form.flexibility')}
            style={{ width: '60%' }}
            toogleValue={formData.flexible_dates}
            onToggle={(value) => updateFormField('flexible_dates', value)}
          />
          <TextInputWithIcon
            fonsiName="euro"
            placeholder={t('details.form.budget')}
            style={{ width: '40%' }}
            value={formData.budget}
            onChangeText={(text) => updateFormField('budget', text)}
          />
        </View>

        {/* Commentaire pour le prestataire */}
        <TextInput
          placeholder={t('details.form.comments')}
          multiline
          numberOfLines={4}
          style={[styles.textArea, styles.textInput]}
          value={formData.commentaires_dates}
          onChangeText={(text) => updateFormField('commentaires_dates', text)}
          placeholderTextColor={'#999'}
        />

        {/* Commentaire personnel */}
        <TextInput
          placeholder={t('details.form.format')}
          multiline
          numberOfLines={4}
          style={[styles.textArea, styles.textInput]}
          value={formData.format}
          onChangeText={(text) => updateFormField('format', text)}
          placeholderTextColor={'#999'}
        />
      </View>
    </KeyboardAwareScrollView>
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
    minHeight: 100,
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
