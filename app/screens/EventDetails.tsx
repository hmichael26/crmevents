import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import {useTheme} from '../hooks/';
import {Block, Button, Input, Image, Switch, Modal, Text} from '../components/';
// import { Container } from './styles';

const EventDetails: React.FC = () => {

    const {assets, colors, gradients, sizes} = useTheme();



  return <SafeAreaView style={{flex: 1,backgroundColor:"#fff"}}>

    <View style={{marginHorizontal:30}}>
    <Button flex={1} gradient={gradients.primary} marginBottom={sizes.base} >
          <Text white bold transform="uppercase" size={20}>
            Détails de l'Event
          </Text>
        </Button>

    <View style={{flexDirection:"row",justifyContent:"space-around",gap:10,marginHorizontal: 10,marginVertical:15}}>
    <Button flex={1} gradient={gradients.black} marginBottom={sizes.base} rounded={false} round={false}>
          <Text white bold transform="uppercase" size={15}>
            Dates 
          </Text>
        </Button>
        <Button flex={1} gradient={gradients.info} marginBottom={sizes.base} rounded={false} round={false}>
          <Text white bold transform="uppercase" size={15}>
           
           CLients
          </Text>
        </Button>
        <Button flex={1} gradient={gradients.success} marginBottom={sizes.base} rounded={false} round={false}>
          <Text white bold transform="uppercase" size={15}>
           COM %
          </Text>
        </Button>
    </View>
    </View>
   <View></View>
   <View></View>
  </SafeAreaView>;
}

export default EventDetails;