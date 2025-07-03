import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
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
  const { assets, colors, gradients, sizes } = useTheme()

  const buttonGradient =
    badgeColor && gradients[badgeColor]
      ? gradients[badgeColor]
      : gradients.secondary

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Button
        flex={1}
        gradient={buttonGradient}
        marginBottom={sizes.base / 3}
        rounded={false}
        round={false}
        style={[
          {
            marginHorizontal: 10,
            marginTop: 3,
          },
          isActive && { paddingRight: 40 }, // Ajouter un style conditionnel si `isActive` est vrai
        ]}
        onPress={onPress}
      >
        {badgeNumber != 0 && (
          <View
            style={{
              position: 'absolute',
              backgroundColor: colors.danger,
              right: -23,
              top: -23,
              margin: 20,
              width: 45,
              height: 45,
              borderRadius: 55,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '' }}>{badgeNumber}</Text>
          </View>
        )}
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '',
            textTransform: 'uppercase',
            paddingVertical: 5,
          }}
        >
          {text}
        </Text>
      </Button>

      {isActive && onDelete && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 0,
            top: 10,
            padding: 10,
          }}
          onPress={onDelete}
        >
          <Icon name="trash" size={20} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default Badge
