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
  duration = 3000,
  onHide,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto-hide après la durée spécifiée
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration]) // Ajout de duration dans les dépendances

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide()
    })
  }, [fadeAnim, slideAnim, onHide])

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast
      case 'error':
        return styles.errorToast
      case 'warning':
        return styles.warningToast
      case 'info':
        return styles.infoToast
      default:
        return styles.successToast
    }
  }

  const getTextStyle = () => {
    switch (type) {
      case 'success':
        return styles.successText
      case 'error':
        return styles.errorText
      case 'warning':
        return styles.warningText
      case 'info':
        return styles.infoText
      default:
        return styles.successText
    }
  }

  if (!visible) return null

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
        style={[styles.toast, getToastStyle()]}
        onPress={hideToast}
        activeOpacity={0.8}
      >
        <Text style={[styles.message, getTextStyle()]}>{message}</Text>
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
    duration: 3000,
  })

  // Référence pour éviter les appels multiples
  const toastTimeoutRef = useRef(null)
  const lastToastRef = useRef(null)

  const showToast = useCallback(
    (message, type = 'success', duration = 3000) => {
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
      }, 1000)
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
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Styles pour les différents types
  successToast: {
    backgroundColor: '#4CAF50',
  },
  errorToast: {
    backgroundColor: '#F44336',
  },
  warningToast: {
    backgroundColor: '#FF9800',
  },
  infoToast: {
    backgroundColor: '#2196F3',
  },
  successText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FFFFFF',
  },
  warningText: {
    color: '#FFFFFF',
  },
  infoText: {
    color: '#FFFFFF',
  },
})

export default Toast
