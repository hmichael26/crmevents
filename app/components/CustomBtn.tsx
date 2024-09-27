import React, { useState } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  PressableProps,
  StyleProp
} from 'react-native';

interface CustomButtonProps extends PressableProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  loadingColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  onPress, 
  title, 
  style, 
  textStyle, 
  disabled = false,
  loading = false,
  loadingColor = 'white',
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button, 
        style, 
        disabled && styles.disabled,
        (pressed || isPressed) && styles.pressed
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor} />
      ) : (
        <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: '#A9A9A9',
  },
  disabledText: {
    color: '#D3D3D3',
  },
  pressed: {
   
    transform: [{ scale: 0.98 }],
  },
});

export default CustomButton;