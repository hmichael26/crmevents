import React, { useEffect } from 'react'
import { StyleSheet, Dimensions, ActivityIndicator } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
  withRepeat,
} from 'react-native-reanimated'

const { width } = Dimensions.get('window')

interface ModernSplashScreenProps {
  onAnimationEnd?: () => void
}

const ModernSplashScreen: React.FC<ModernSplashScreenProps> = ({
  onAnimationEnd,
}) => {
  const opacity = useSharedValue(1)
  const scale = useSharedValue(1)

  useEffect(() => {
    // Animation de l'échelle
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease }),
      ),
      -1,
      true,
    )

    // Animation de l'opacité pour disparaître progressivement
    opacity.value = withTiming(
      0,
      { duration: 800, easing: Easing.out(Easing.ease) },
      (finished) => {
        if (finished && onAnimationEnd) {
          onAnimationEnd() // Appeler le callback si défini
        }
      },
    )
  }, [])

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const loaderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.loaderContainer, loaderStyle]}>
        <ActivityIndicator size="large" color="#B62D78FF" />
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Couleur de fond personnalisée
  },
  loaderContainer: {
    width: width * 0.2,
    height: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: (width * 0.2) / 2,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // Texte blanc pour contraste
    marginTop: 20,
  },
})

export default ModernSplashScreen
