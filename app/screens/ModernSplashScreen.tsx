import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ModernSplashScreenProps {
  handleFinish: () => void;
}

const ModernSplashScreen: React.FC<ModernSplashScreenProps> = ({ }) => {

  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    // Animate progress
    progress.value = withTiming(1, {
      duration: 2000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // Animate scale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );

    // Handle finish animation
    const timeout = setTimeout(() => {
      opacity.value = withTiming(
        0,
        {
          duration: 800,
          easing: Easing.out(Easing.ease),
        },
        (finished) => {
          if (finished) {

          }
        }
      );
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{
      translateY: interpolate(
        progress.value,
        [0, 1],
        [20, 0],
        Extrapolate.CLAMP
      ),
    }],
  }));

  const loaderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.loaderContainer, loaderStyle]}>
        <ActivityIndicator size="large" color="#0E1070FF" />
      </Animated.View>
      <Animated.Text style={[styles.text, textStyle]}>
        CRM EVENT
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFFFF',
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
  },
});

export default ModernSplashScreen;