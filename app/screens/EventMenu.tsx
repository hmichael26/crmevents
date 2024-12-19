import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { useTheme } from '../hooks/';
import { Block, Button, Text } from '../components/';

type RootStackParamList = {
  EventMenu: { item: ItemType };
  Eventdetails: { item: ItemType };
  EventPresta: { item: ItemType };
  // Ajouter d'autres écrans si nécessaire
};

interface ItemType {
  evt: string;
  id: number;
  ref: number;
  name: string;
  description: string;
  arrderoules: any[];
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

  const arrderoules = item?.arrderoules;
  const handleNavigation = useCallback(
    (to: keyof RootStackParamList, item: ItemType) => {
      setActive(to);
      navigation.navigate(to, { item });
    },
    [navigation]
  );

  const gradientKeys = useMemo(() => {
    return Object.keys(gradients).filter(key =>
      gradients[key] &&
      ['primary', 'secondary', 'tertiary', 'gray', 'danger', 'warning', 'success', 'info'].includes(key) &&
      gradients[key].length > 0
    );
  }, [gradients]);

  // Fonction pour obtenir un gradient aléatoire
  const getRandomGradient = useMemo(() => {
    return () => {
      const randomIndex = Math.floor(Math.random() * gradientKeys.length);
      return gradientKeys[randomIndex];
    };
  }, [gradientKeys]);

  // Assignation de gradients aléatoires fixes pour chaque élément
  const itemGradients = useMemo(() => {
    return arrderoules.map(() => getRandomGradient());
  }, [arrderoules, getRandomGradient]);

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

      {arrderoules.length > 0 && arrderoules.map((item: any, index: number) => (
        <Button flex={1} gradient={gradients[itemGradients[index]]} marginBottom={sizes.base} onPress={() => handleNavigation('EventPresta', item)}>
          <Text white bold transform="uppercase">
            {item.titre_deroule}
          </Text>
        </Button>
      ))}



      <Button flex={1} gradient={gradients.light} marginBottom={sizes.base} onPress={() => handleNavigation('EventPresta', item)}>
        <Text bold transform="uppercase">
          + Ajouter un Deroule
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