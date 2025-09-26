import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import {
  StackHeaderProps,
  CardStyleInterpolators,
} from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/core'
import { DrawerActions } from '@react-navigation/native'
import { StackHeaderOptions } from '@react-navigation/stack/lib/typescript/src/types'

import { useData } from './useData'
// import {useTranslation} from './useTranslation';

import Image from '../components/Image'
//import Text from '../components/Text';
import useTheme from '../hooks/useTheme'
import Button from '../components/Button'
import Block from '../components/Block'
import { Input } from '../components'

export default () => {
  // const {t} = useTranslation();
  const { user, basket, isDark } = useData()
  const navigation = useNavigation()
  const { icons, colors, gradients, sizes } = useTheme()
  const labelColor = isDark ? colors.white : colors.dark
  const menu = {
    headerStyle: { elevation: 0 },
    headerTitleAlign: 'left',
    headerTitleStyle: {
      fontSize: 15,
    },
    headerTitleContainerStyle: { marginLeft: -sizes.sm },
    headerLeftContainerStyle: { paddingLeft: sizes.s },
    headerRightContainerStyle: { paddingRight: sizes.s },
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    // headerTitle: ({children}: StackHeaderTitleProps) => (
    //   <Text p>{children}</Text>
    // ),
    headerLeft: () => (
      <Button onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
        <Image
          source={icons.menu}
          radius={0}
          color={labelColor}
          width={20}
          height={20}
          style={{ marginRight: sizes.sm }}
        />
      </Button>
    ),
  } as StackHeaderOptions

  const options = {
    stack: menu,
    components: {
      ...menu,
      headerTitle: () => (
        <Text p white>
          Test
        </Text>
      ),
      headerRight: () => null,
      headerLeft: () => (
        <Button
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Image source={icons.menu} radius={0} color={colors.white} />
        </Button>
      ),
    },
    notifications: {
      ...menu,
      headerRight: () => null,
      headerLeft: () => (
        <Button>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.icon}
            source={icons.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
      ),
    },
    back: {
      ...menu,
      headerRight: () => null,
      headerLeft: () => (
        <Button onPress={() => navigation.goBack()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.icon}
            source={icons.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
      ),
    },
    profile: {
      ...menu,
    },
    chat: {
      ...menu,
      headerLeft: () => (
        <Button onPress={() => navigation.goBack()}>
          <Image
            radius={0}
            width={15}
            height={19}
            color={colors.icon}
            source={icons.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
      ),
    },
    rental: {
      ...menu,
      headerLeft: () => (
        <Button onPress={() => navigation.goBack()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.icon}
            source={icons.arrow}
            transform={[{ rotate: '180deg' }]}
          />
        </Button>
      ),
    },
    eventDetail: {
      ...menu,
      headerTitle: ({ children }: any) => (
        <Text
          style={{
            marginHorizontal: 7,
            fontSize: 15,

            color: labelColor,
          }}
        >
          DÉTAILS DU PROJET
        </Text>
      ),
      headerLeft: () => (
        <Button
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Image source={icons.menu} radius={0} color={labelColor} />
        </Button>
      ),
      headerRight: () => (
        <Block row flex={0} align="center" marginRight={5}>
          <Input
            search
            style={{ width: 110, marginHorizontal: 15, fontSize: 13 }}
            placeholder="REF"
          ></Input>
          <TouchableOpacity style={{ marginRight: sizes.sm }}>
            <Image source={icons.bell} radius={0} color={colors.icon} />
            <Block
              flex={0}
              right={0}
              width={sizes.s}
              height={sizes.s}
              radius={sizes.xs}
              position="absolute"
              gradient={gradients?.primary}
            />
          </TouchableOpacity>
        </Block>
      ),
    },
  }

  return options
}
