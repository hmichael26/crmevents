import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'

const { width } = Dimensions.get('window')

const Toast = ({
  visible,
  message,
  type = 'success',
  duration = 2000,
  onHide,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-80)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Reset progress
      progressAnim.setValue(0)

      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start()

      // Animation de la barre de progression
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start()

      // Auto-hide après la durée spécifiée
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration])

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide()
    })
  }, [fadeAnim, slideAnim, onHide])

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Transparence ajoutée
          borderColor: '#22C55E',
          textColor: '#1F2937',
          iconBg: 'rgba(220, 252, 231, 0.9)', // Transparence ajoutée
          iconColor: '#22C55E',
          icon: '✓',
          progressColor: '#22C55E',
        }
      case 'error':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Transparence ajoutée
          borderColor: '#EF4444',
          textColor: '#1F2937',
          iconBg: 'rgba(254, 226, 226, 0.9)', // Transparence ajoutée
          iconColor: '#EF4444',
          icon: '✕',
          progressColor: '#EF4444',
        }
      case 'warning':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Transparence ajoutée
          borderColor: '#F59E0B',
          textColor: '#1F2937',
          iconBg: 'rgba(254, 243, 199, 0.9)', // Transparence ajoutée
          iconColor: '#F59E0B',
          icon: '⚠',
          progressColor: '#F59E0B',
        }
      case 'info':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Transparence ajoutée
          borderColor: '#3B82F6',
          textColor: '#1F2937',
          iconBg: 'rgba(219, 234, 254, 0.9)', // Transparence ajoutée
          iconColor: '#3B82F6',
          icon: 'ℹ',
          progressColor: '#3B82F6',
        }
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Transparence ajoutée
          borderColor: '#22C55E',
          textColor: '#1F2937',
          iconBg: 'rgba(220, 252, 231, 0.9)', // Transparence ajoutée
          iconColor: '#22C55E',
          icon: '✓',
          progressColor: '#22C55E',
        }
    }
  }

  if (!visible) return null

  const config = getToastConfig()

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.toast,
          {
            backgroundColor: config.backgroundColor,
            borderLeftColor: config.borderColor,
          },
        ]}
        onPress={hideToast}
        activeOpacity={0.9}
      >
        <View style={styles.toastContent}>
          <Text style={[styles.message, { color: config.textColor }]}>
            {message}
          </Text>
        </View>

        {/* Barre de progression */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: config.progressColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Hook personnalisé optimisé pour éviter les doubles exécutions
export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
    duration: 2000,
  })

  // Référence pour éviter les appels multiples
  const toastTimeoutRef = useRef(null)
  const lastToastRef = useRef(null)

  const showToast = useCallback(
    (message, type = 'success', duration = 2000) => {
      // Éviter les doubles appels avec le même message
      const toastKey = `${message}-${type}-${Date.now()}`
      if (lastToastRef.current === toastKey) {
        console.log('Toast dupliqué évité:', message)
        return
      }
      lastToastRef.current = toastKey

      // Nettoyer le timeout précédent si il existe
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }

      setToast({
        visible: true,
        message,
        type,
        duration,
      })

      // Reset de la référence après un délai
      toastTimeoutRef.current = setTimeout(() => {
        lastToastRef.current = null
      }, 2000)
    },
    [],
  )

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
    // Reset de la référence lors du masquage
    lastToastRef.current = null
  }, [])

  const ToastComponent = useCallback(
    () => (
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    ),
    [toast.visible, toast.message, toast.type, toast.duration, hideToast],
  )

  return {
    showToast,
    hideToast,
    ToastComponent,
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
})

export default Toast
