import React from 'react';
import { View, Text } from 'react-native';
import Button from './Button';
import { useTheme } from '../hooks';
import { ITheme } from '../constants/types';

// import { Container } from './styles';

interface HotelButtonWithBadgeProps {
  badgeNumber?: number;
  text?: string;
  badgeColor: any
  onPress: () => void;


}
const Badge: React.FC<HotelButtonWithBadgeProps> = ({ badgeNumber, text, badgeColor,onPress }) => {
  const { assets, colors, gradients, sizes } = useTheme();


  const buttonGradient = badgeColor && gradients[badgeColor] ? gradients[badgeColor] : gradients.success;

  return <Button flex={1} gradient={buttonGradient} marginBottom={sizes.base / 3} rounded={false} round={false} style={{ marginHorizontal: 10, marginTop: 3 }} onPress={onPress} >
    {badgeNumber != 0 && <View style={{ position: "absolute", backgroundColor: colors.danger, right: -23, top: -23, margin: 20, width: 30, height: 25, borderRadius: 55, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "bold" }}> {badgeNumber} </Text>
    </View>}
    <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textTransform: "uppercase" }}>

      {text}
    </Text>

  </Button>;
}

export default Badge;