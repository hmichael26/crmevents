import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native'
import { BlurView } from 'expo-blur'
import Button from './Button'
import { useTheme } from '../hooks'

const { width } = Dimensions.get('window')

interface CustomDatePickerProps {
  visible: boolean
  onClose: () => void
  onConfirm: (date: string) => void
  initialDate?: string
  minDate?: Date
  maxDate?: Date
  title?: string
}

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDate,
  minDate,
  maxDate,
  title = 'Sélectionner une date',
}) => {
  const { colors, gradients, sizes } = useTheme()

  const parseInitialDate = (): Date => {
    if (initialDate) {
      const [day, month, year] = initialDate
        .split('/')
        .map((num) => parseInt(num, 10))
      const date = new Date(year, month - 1, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    return new Date()
  }

  const initialParsedDate = parseInitialDate()
  const [currentMonth, setCurrentMonth] = useState(initialParsedDate.getMonth())
  const [currentYear, setCurrentYear] = useState(
    initialParsedDate.getFullYear(),
  )
  const [tempSelectedDate, setTempSelectedDate] = useState(initialParsedDate)
  const [showYearSelector, setShowYearSelector] = useState(false)
  const [yearInput, setYearInput] = useState(
    String(initialParsedDate.getFullYear()),
  )

  useEffect(() => {
    if (visible) {
      const parsedDate = parseInitialDate()
      setCurrentMonth(parsedDate.getMonth())
      setCurrentYear(parsedDate.getFullYear())
      setTempSelectedDate(parsedDate)
      setYearInput(String(parsedDate.getFullYear()))
      setShowYearSelector(false)
    }
  }, [visible, initialDate])

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days: (number | null)[] = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handlePreviousYear = () => {
    const newYear = currentYear - 1
    setCurrentYear(newYear)
    setYearInput(String(newYear))
  }

  const handleNextYear = () => {
    const newYear = currentYear + 1
    setCurrentYear(newYear)
    setYearInput(String(newYear))
  }

  const handleYearInputChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '')
    setYearInput(cleaned)
  }

  const handleYearInputSubmit = () => {
    const year = parseInt(yearInput, 10)
    if (!isNaN(year) && year >= 1900 && year <= 2100) {
      setCurrentYear(year)
      setShowYearSelector(false)
    }
  }

  const handleDayPress = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)

    if (minDate && newDate < minDate) return
    if (maxDate && newDate > maxDate) return

    setTempSelectedDate(newDate)
  }

  const handleConfirm = () => {
    const day = String(tempSelectedDate.getDate()).padStart(2, '0')
    const month = String(tempSelectedDate.getMonth() + 1).padStart(2, '0')
    const year = tempSelectedDate.getFullYear()
    const formattedDate = `${day}/${month}/${year}`

    onConfirm(formattedDate)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const isSelectedDay = (day: number) => {
    return (
      tempSelectedDate.getDate() === day &&
      tempSelectedDate.getMonth() === currentMonth &&
      tempSelectedDate.getFullYear() === currentYear
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    )
  }

  const isDayDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const calendarDays = generateCalendarDays()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {showYearSelector ? (
              <View style={styles.yearSelectorContainer}>
                <View style={styles.yearNavigationRow}>
                  <Button
                    onPress={handlePreviousYear}
                    gradient={gradients.primary}
                    round
                    width={40}
                    height={40}
                    shadow={false}
                  >
                    <Text style={styles.navButtonText}>‹</Text>
                  </Button>

                  <TextInput
                    style={styles.yearInput}
                    value={yearInput}
                    onChangeText={handleYearInputChange}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholder="AAAA"
                    onSubmitEditing={handleYearInputSubmit}
                  />

                  <Button
                    onPress={handleNextYear}
                    gradient={gradients.primary}
                    round
                    width={40}
                    height={40}
                    shadow={false}
                  >
                    <Text style={styles.navButtonText}>›</Text>
                  </Button>
                </View>

                <View style={styles.yearSelectorButtons}>
                  <Button
                    onPress={() => setShowYearSelector(false)}
                    style={{ borderWidth: 0.8 }}
                    flex={1}
                    shadow={false}
                    height={38}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </Button>

                  <Button
                    onPress={handleYearInputSubmit}
                    gradient={gradients.primary}
                    flex={1}
                    shadow={false}
                    height={40}
                  >
                    <Text style={styles.confirmButtonText}>OK</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.navigation}>
                  <Button
                    onPress={handlePreviousMonth}
                    gradient={gradients.primary}
                    round
                    width={40}
                    height={40}
                    shadow={false}
                  >
                    <Text style={styles.navButtonText}>‹</Text>
                  </Button>

                  <TouchableOpacity onPress={() => setShowYearSelector(true)}>
                    <Text style={styles.monthYearText}>
                      {MONTHS[currentMonth]} {currentYear}
                    </Text>
                  </TouchableOpacity>

                  <Button
                    onPress={handleNextMonth}
                    gradient={gradients.primary}
                    round
                    width={40}
                    height={40}
                    shadow={false}
                  >
                    <Text style={styles.navButtonText}>›</Text>
                  </Button>
                </View>

                <View style={styles.dayHeadersContainer}>
                  {DAYS.map((day) => (
                    <View key={day} style={styles.dayHeader}>
                      <Text style={styles.dayHeaderText}>{day}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {calendarDays.map((day, index) => (
                    <View key={index} style={styles.dayCell}>
                      {day ? (
                        <TouchableOpacity
                          onPress={() => handleDayPress(day)}
                          disabled={isDayDisabled(day)}
                          style={[
                            styles.dayButton,
                            isSelectedDay(day) && {
                              backgroundColor: colors.primary,
                            },
                            isToday(day) &&
                              !isSelectedDay(day) && {
                                borderWidth: 2,
                                borderColor: colors.success,
                              },
                            isDayDisabled(day) && styles.disabledDay,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isSelectedDay(day) && styles.selectedDayText,
                              isToday(day) &&
                                !isSelectedDay(day) && {
                                  color: colors.success,
                                  fontWeight: '700',
                                },
                              isDayDisabled(day) && styles.disabledDayText,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                </View>

                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Date sélectionnée :</Text>
                  <Text style={[styles.previewDate, { color: colors.primary }]}>
                    {String(tempSelectedDate.getDate()).padStart(2, '0')}/
                    {String(tempSelectedDate.getMonth() + 1).padStart(2, '0')}/
                    {tempSelectedDate.getFullYear()}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    onPress={handleCancel}
                    style={{ borderWidth: 0.8 }}
                    flex={1}
                    shadow={false}
                    height={38}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </Button>

                  <Button
                    onPress={handleConfirm}
                    gradient={gradients.primary}
                    flex={1}
                    shadow={false}
                    height={40}
                  >
                    <Text style={styles.confirmButtonText}>Confirmer</Text>
                  </Button>
                </View>
              </>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    width: width * 0.9,
    maxWidth: 400,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  navButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  yearSelectorContainer: {
    marginBottom: 20,
  },
  yearNavigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  yearInput: {
    flex: 1,
    marginHorizontal: 16,
    height: 50,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A1A',
  },
  yearSelectorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dayHeadersContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  disabledDayText: {
    color: '#CCCCCC',
  },
  previewContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 24,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
