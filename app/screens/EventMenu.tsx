import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { useTheme } from '../hooks/';
import { Block, Button, Text } from '../components/';
import AuthContext from '../context/AuthContext';
import { useApi } from '../context/useApi';
import * as SecureStore from 'expo-secure-store';

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



  const storedToken = async () => {
    try {
      const value = await SecureStore.getItemAsync('accessToken');
      return value;
    } catch (e) {
      console.log(e);
    }
  };

  // console.log(item)

  const { getevent } = useApi();

  const { gradients, sizes } = useTheme();
  const [active, setActive] = useState('');
  const [data, setData] = useState<ItemType | null>(null);

  useEffect(() => {
    if (item?.idevt) {
      getevent({ idevt: item.idevt, token: storedToken }).then(response => {

        setData(response.data);
      });
    }
  }, [])

  const arrderoules = data?.arrderoules;
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

  const itemGradients = useMemo(() => {
    if (!data?.arrderoules) return [];
    return data.arrderoules.map(() => getRandomGradient());
  }, [data?.arrderoules, getRandomGradient]);

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
  // console.log(data)

  async function handlepush(): Promise<void> {
    try {
      const value = await getevent({ idevt: item.idevt, token: storedToken });


      if (value.data) {

        // console.log(value.data)
        handleNavigation('Eventdetails', value.data);
        return;
      } else {

        return;
      }
    } catch (e) {
      console.log(e);
    }
  }


  if (!data) {
    return <Text p>Chargement...</Text>;
  }

  if (!data.arrderoules || data.arrderoules.length === 0) {
    return <Text p>Aucun deroule associé à cet évènement</Text>;
  }


  return (
    <Block paddingHorizontal={sizes.padding}>
      <Button flex={1} gradient={gradients.primary} marginBottom={sizes.base} onPress={() => handlepush()} >
        <Text white bold transform="uppercase">
          Detail de l'Evenement
        </Text>
      </Button>

      {data && data.arrderoules.map((item: any, index: number) => (
        <Button flex={1} gradient={gradients[itemGradients[index]]} key={item.id || index} marginBottom={sizes.base} onPress={() => handleNavigation('EventPresta', item)}>
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