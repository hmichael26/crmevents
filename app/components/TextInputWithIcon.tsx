import React, { useState } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
  Pressable,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Fontisto from 'react-native-vector-icons/Fontisto'
import Switch from './Switch'

// TextInputWithIcon Component
interface TextInputWithIconProps extends TextInputProps {
  iconName?: string
  fonsiName?: string
  onPress?: () => void
}

const TextInputWithIcon: React.FC<TextInputWithIconProps> = ({
  iconName,
  fonsiName,
  onPress,
  style,
  ...props
}) => {
  return (
    <Pressable onPress={onPress} style={[styles.inputContainer, style]}>
      {iconName && (
        <Icon name={iconName} size={20} color="gray" style={styles.icon} />
      )}
      {fonsiName && (
        <Fontisto name={fonsiName} size={20} color="gray" style={styles.icon} />
      )}
     
        <TextInput
          style={styles.input}
          {...props}
          placeholderTextColor="#ccc"
        />
      
    </Pressable>
  )
}

// SwitchTextBox Component
interface SwitchTextBoxProps extends Partial<TextInputProps> {
  label: string
  onToggle: (value: boolean) => void
  toogleValue?: boolean
}

const SwitchTextBox: React.FC<SwitchTextBoxProps> = ({
  label,
  onToggle,
  style,
  toogleValue,
  ...props
}) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [switch1, setSwitch1] = useState(toogleValue)

  const toggleSwitch = () => {
    const newValue = !switch1
    setSwitch1(newValue)
    onToggle(newValue)
  }

  return (
    <View style={[styles.switchContainer, style]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Switch checked={switch1} onPress={toggleSwitch} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 13,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    width: '100%',
    height: 40,
  },
  switchContainer: {
    marginBottom: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ccc',
  },
  switchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
})

export { TextInputWithIcon, SwitchTextBox }
