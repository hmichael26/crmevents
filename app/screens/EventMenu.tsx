import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, View, Text as Text2 } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  RouteProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native'
import { DrawerNavigationProp } from '@react-navigation/drawer'

import { useTheme } from '../hooks/'
import { Block, Button, Text } from '../components/'
import AuthContext from '../context/AuthContext'
import { useApi } from '../context/useApi'
import * as SecureStore from 'expo-secure-store'
import StatusDropdown from '../components/StatusDrop'
import { useToast } from '../components/ToastComponent'

type RootStackParamList = {
  EventMenu: { item: ItemType }
  Eventdetails: { item: ItemType }
  EventPresta: { item: ItemType }
}

interface ItemType {
  evt: string
  id: number
  ref: number
  name: string
  description: string
  arrderoules: any[]
  idevt?: number // Ajouté car utilisé dans le code
}

type EventMenuNavigationProp = DrawerNavigationProp<
  RootStackParamList,
  'EventMenu'
>
type EventMenuRouteProp = RouteProp<RootStackParamList, 'EventMenu'>

interface EventMenuProps {
  route: EventMenuRouteProp
}

interface ButtonsProps {
  item: ItemType
  navigation: EventMenuNavigationProp
}

const Buttons: React.FC<ButtonsProps> = ({ item, navigation }) => {
  const { showToast, ToastComponent } = useToast()

  const storedToken = async () => {
    try {
      const value = await SecureStore.getItemAsync('accessToken')
      return value
    } catch (e) {
      console.log(e)
    }
  }

  const { getevent } = useApi()
  const { gradients, sizes } = useTheme()
  const [active, setActive] = useState('')
  const [data, setData] = useState<ItemType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Charger les données à chaque fois que l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      if (item?.idevt) {
        setIsLoading(true)
        //     console.log("Rechargement des données de l'événement")

        getevent({ idevt: item.idevt })
          .then((response) => {
            //console.log(response.data)
            setData(response.data)
          })
          .catch((error) => {
            console.error('Erreur lors du chargement:', error)
          })
          .finally(() => {
            setIsLoading(false)
          })
      }
    }, []), // Tableau de dépendances vide pour éviter les boucles
  )

  const arrderoules = data?.arrderoules

  const handleNavigation = useCallback(
    (to: keyof RootStackParamList, item: ItemType) => {
      //   console.log(item)
      setActive(to)
      navigation.navigate(to, { item })
    },
    [navigation],
  )

  const gradientKeys = useMemo(() => {
    const predefinedOrder = [
      'success',
      'info',
      'secondary',
      'tertiary',
      'danger',
      'warning',
    ]

    return predefinedOrder.filter(
      (key) => gradients[key] && gradients[key].length > 0,
    )
  }, [gradients])

  const getGradientByIndex = useCallback(
    (index) => gradientKeys[index % gradientKeys.length],
    [gradientKeys],
  )

  const itemGradients = useMemo(() => {
    if (!data?.arrderoules) return []
    return data.arrderoules.map((_, index) => getGradientByIndex(index))
  }, [data?.arrderoules, getGradientByIndex])

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
          onPress: () => handleNavigation('Eventdetails', data), // Utilisez `data` au lieu de `item`
        },
      ],
      { cancelable: true },
    )
  }

  async function handlepush(): Promise<void> {
    try {
      const value = await getevent({ idevt: item.idevt, token: storedToken })

      if (value.data) {
        // Passez toutes les données de l'événement, pas seulement evt et idevt
        handleNavigation('Eventdetails', {
          ...value.data,
          idevt: value.data.idevt || item.idevt, // Assurez-vous que idevt est présent
        })
        return
      } else {
        return
      }
    } catch (e) {
      console.log(e)
    }
  }

  if (isLoading || !data) {
    return (
      <View style={{ marginBottom: 10 }}>
        <Text2 style={{ color: 'red', fontSize: 20, textAlign: 'center' }}>
          chargement ...
        </Text2>
      </View>
    )
  }

  return (
    <>
      <ToastComponent />
      <Block paddingHorizontal={sizes.padding}>
        <Button
          flex={1}
          gradient={gradients.primary}
          onPress={() => handlepush()}
        >
          <Text white bold transform="uppercase">
            Detail de l'Evenement
          </Text>
        </Button>

        <Block marginBottom={sizes.base} marginTop={sizes.base}>
          <StatusDropdown
            initialStatus={data?.type}
            itemId={item.idevt}
            onStatusChange={(newStatus, apiResponse) => {
              if (apiResponse?.code == 'SUCCESS') {
                showToast(
                  '✅ Statut mis à jour vers: ' + newStatus.label,
                  'success',
                )
              } else {
                showToast('❌ Erreur lors de la mise à jour du statut', 'error')
              }
            }}
          />
        </Block>

        {data &&
          data.arrderoules.map((item: any, index: number) => (
            <Button
              flex={1}
              gradient={gradients[itemGradients[index]]}
              key={item.id || index}
              marginBottom={sizes.base / 2}
              onPress={() =>
                handleNavigation('EventPresta', { ...item, isNew: false })
              }
            >
              <Text white bold transform="uppercase">
                {item.titre_deroule}
              </Text>
            </Button>
          ))}

        {data && data.arrderoules.length < 5 && (
          <Button
            flex={1}
            gradient={gradients.light}
            marginBottom={sizes.base}
            onPress={() =>
              handleNavigation('EventPresta', { ...item, isNew: true })
            }
          >
            <Text bold transform="uppercase">
              + Ajouter un Deroule
            </Text>
          </Button>
        )}
      </Block>
    </>
  )
}

const EventMenu: React.FC<EventMenuProps> = ({ route }) => {
  const { item } = route.params
  // console.log(item)
  const { sizes } = useTheme()
  const navigation = useNavigation<EventMenuNavigationProp>()

  //console.log(item)

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
        marginTop: -sizes.sm,
        flexDirection: 'column',
      }}
    >
      <Block>
        <Block
          scroll
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: sizes.padding }}
        >
          <Block>
            <Text
              bold
              align="center"
              marginBottom={30}
              size={18}
              transform="uppercase"
              style={{ flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {item?.evt}
            </Text>
            <Buttons item={item} navigation={navigation} />
          </Block>
        </Block>
      </Block>
    </SafeAreaView>
  )
}

export default EventMenu
