import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

const Toast = ({ 
  visible, 
  message, 
  type = 'success', 
  duration = 3000, 
  onHide 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

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
      ]).start();

      // Auto-hide après la durée spécifiée
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
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
      if (onHide) onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      case 'warning':
        return styles.warningToast;
      case 'info':
        return styles.infoToast;
      default:
        return styles.successToast;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'success':
        return styles.successText;
      case 'error':
        return styles.errorText;
      case 'warning':
        return styles.warningText;
      case 'info':
        return styles.infoText;
      default:
        return styles.successText;
    }
  };

  if (!visible) return null;

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
  );
};

// Hook personnalisé pour gérer les toasts
export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const ToastComponent = () => (
    <Toast
      visible={toast.visible}
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onHide={hideToast}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
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
});

export default Toast;