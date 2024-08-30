import React from 'react';
import { View,Text } from 'react-native';
import Button from './Button';
import { useTheme } from '../hooks';

// import { Container } from './styles';

interface HotelButtonWithBadgeProps {
    badgeNumber?: number;
  
  }
const Badge: React.FC<HotelButtonWithBadgeProps>= ({badgeNumber}) => {
    const { assets, colors, gradients, sizes } = useTheme();


  return <Button flex={1} gradient={gradients.success} marginBottom={sizes.base/3} rounded={false} round={false} style={{marginHorizontal:10,marginTop:3}} >
  <View style={{ position: "absolute", backgroundColor: colors.danger, right: -23, top: -23, margin: 20, width: 30, height: 25, borderRadius: 55, display: "flex", justifyContent: "center", alignItems: "center" }}>
    <Text style={{ color: "#fff", fontWeight: "bold" }}> {badgeNumber} </Text>
  </View>
  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", textTransform: "uppercase" }}>

    Hôtel  NORMANDY
  </Text>

</Button>;
}

export default Badge;