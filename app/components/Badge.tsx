import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Button from './Button'
import { useTheme } from '../hooks'
import Icon from 'react-native-vector-icons/FontAwesome6'

interface BadgeProps {
  badgeNumber?: number
  text?: string
  badgeColor: string
  onPress: () => void
  onDelete?: () => void
  isActive: boolean
}

const Badge: React.FC<BadgeProps> = ({
  badgeNumber,
  text,
  badgeColor,
  onPress,
  onDelete,
  isActive,
}) => {
  const { colors, gradients, sizes } = useTheme()

  const buttonGradient =
    badgeColor && gradients[badgeColor]
      ? gradients[badgeColor]
      : gradients.secondary

  const showDeleteButton = isActive && onDelete
  const showBadgeNumber = badgeNumber && badgeNumber > 0

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.buttonContainer,
          showDeleteButton && styles.buttonContainerActive,
        ]}
      >
        <Button
          flex={1}
          gradient={buttonGradient}
          marginBottom={sizes.base / 3}
          rounded={false}
          round={false}
          style={[styles.button, showDeleteButton && styles.buttonActive]}
          onPress={onPress}
        >
          {/* Button Text - Always centered */}
          <View style={styles.textContainer}>
            <Text style={styles.buttonText}>{text}</Text>
          </View>
        </Button>

        {/* Delete Button */}
        {showDeleteButton && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="trash" size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainerActive: {
    paddingRight: 35, // Espace pour le bouton delete
  },
  button: {
    marginTop: 3,
    minHeight: 45,
    position: 'relative',
  },
  buttonActive: {
    // Le bouton prend moins d'espace quand actif
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  badgeNumber: {
    position: 'absolute',
    right: -15,
    top: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3, // Pour Android
    shadowColor: '#000', // Pour iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgeNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default Badge
