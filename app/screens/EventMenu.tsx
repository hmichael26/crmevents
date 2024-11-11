import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { useTheme } from '../hooks/';
import { Block, Button, Text } from '../components/';

type RootStackParamList = {
  EventMenu: { item: ItemType };
  Eventdetails: { item: ItemType };
  // Ajouter d'autres écrans si nécessaire
};

interface ItemType {
  evt: string;
  id: number;
  ref: number;
  name: string;
  description: string;
}

type EventMenuNavigationProp = DrawerNavigationProp<RootStackParamList, 'EventMenu'>;
type EventMenuRouteProp = RouteProp<RootStackParamList, 'EventMenu'>;

interface EventMenuProps {
  route: EventMenuRouteProp;
}

interface ButtonsProps {
  item: ItemType;
  navigation: EventMenuNavigationProp; // Utiliser EventMenuNavigationProp pour correspondre au type attendu
}

const Buttons: React.FC<ButtonsProps> = ({ item, navigation }) => {
  const { gradients, sizes } = useTheme();
  const [active, setActive] = useState('');

  const handleNavigation = useCallback(
    (to: keyof RootStackParamList, item: ItemType) => {
      setActive(to);
      navigation.navigate(to, { item });
    },
    [navigation]
  );

  const goToEvtsScreen = () => {
    Alert.alert(
      'Confirmation',
      'Souhaitez-vous ouvrir ce projet ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => handleNavigation('Eventdetails', item),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Block paddingHorizontal={sizes.padding}>
      <Button flex={1} gradient={gradients.primary} marginBottom={sizes.base} onPress={() => handleNavigation('Eventdetails', item)} >
        <Text white bold transform="uppercase">
          Detail de l'Evenement
        </Text>
      </Button>
      <Button flex={1} gradient={gradients.secondary} marginBottom={sizes.base}>
        <Text white bold transform="uppercase">
          Lieux Disponibles
        </Text>
      </Button>
      <Button flex={1} gradient={gradients.info} marginBottom={sizes.base}>
        <Text white bold transform="uppercase">
          Team Building
        </Text>
      </Button>
      <Button flex={1} gradient={gradients.success} marginBottom={sizes.base}>
        <Text white bold transform="uppercase">
          Soiree
        </Text>
      </Button>
      <Button flex={1} gradient={gradients.warning} marginBottom={sizes.base}>
        <Text white bold transform="uppercase">
          Transfert Bus
        </Text>
      </Button>
      <Button flex={1} gradient={gradients.light} marginBottom={sizes.base}>
        <Text bold transform="uppercase">
          + Ajouter un Deroule
        </Text>
      </Button>
      <Button flex={1} gradient={gradients.danger} marginBottom={sizes.base}>
        <Text white bold transform="uppercase">
          Tableau Comparateur
        </Text>
      </Button>
    </Block>
  );
};

const EventMenu: React.FC<EventMenuProps> = ({ route }) => {
  const { item } = route.params;
  const { sizes } = useTheme();
  const navigation = useNavigation<EventMenuNavigationProp>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', marginTop: -sizes.sm, flexDirection: 'column' }}>
      <Block>
        <Block
          scroll
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: sizes.padding }}>
          <Block>
            <Text bold align="center" marginBottom={30} size={20} transform="uppercase">
              {item.evt}
            </Text>
            <Buttons item={item} navigation={navigation} />
          </Block>
        </Block>
      </Block>
    </SafeAreaView>
  );
};

export default EventMenu;