import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Animated, Linking, StyleSheet } from 'react-native'
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer'
import Screens from './Screens'
import { Block, Text, Switch, Button, Image } from '../components'
import { useData, useTheme } from '../hooks'
import { AuthContext } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import logo from '../assets/images/splash.png'
import { AtSign, LogOut } from 'react-native-feather'
const Drawer = createDrawerNavigator()

/* drawer menu screens navigation */
const ScreensStack = () => {
  const { colors } = useTheme()
  // const isDrawerOpen = useIsDrawerOpen();
  const isDrawerOpen = true
  const animation = useRef(new Animated.Value(0)).current

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.88],
  })

  const borderRadius = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  })

  const animatedStyle = {
    borderRadius: borderRadius,
    transform: [{ scale: scale }],
  }

  useEffect(() => {
    Animated.timing(animation, {
      duration: 200,
      useNativeDriver: true,
      toValue: isDrawerOpen ? 1 : 0,
    }).start()
  }, [isDrawerOpen, animation])

  return <Screens />
}

/* custom drawer menu */
const DrawerContent = (props: DrawerContentComponentProps) => {
  //console.log(admin)

  const { t, i18n } = useTranslation()
  useEffect(() => {}, [])

  const { navigation } = props
  const { isDark, handleIsDark } = useData()
  // const { t } = useTranslation();
  const [active, setActive] = useState('Home')
  const { assets, colors, gradients, sizes } = useTheme()

  const { Logout, usertoken, userdata } = useContext(AuthContext)
  const admin = userdata?.user?.admin

  const labelColor = isDark ? colors.white : colors.text

  const handleNavigation = useCallback(
    (to: string) => {
      setActive(to)
      // Si l'écran est dans le navigateur imbriqué "Screens"
      navigation.navigate('Screens', { screen: to })
    },
    [navigation, setActive],
  )

  const handleWebLink = useCallback((url: string) => Linking.openURL(url), [])

  const screens = [
    { name: 'ACCUEIL', to: 'Home', icon: assets.home },

    // { name: t('screens.components'), to: 'Components', icon: assets.components },
    // { name: t('screens.articles'), to: 'Articles', icon: assets.document },
    // { name: t('screens.rental'), to: 'Rentals', icon: assets.rental },
    // { name: t('screens.profile'), to: 'Profile', icon: assets.profile },
    // { name: t('screens.settings'), to: 'Settings', icon: assets.settings },
    // { name: t('screens.register'), to: 'Register', icon: assets.register },
    // { name: t('screens.extra'), to: 'Extra', icon: assets.extras },
    // { name: t('screens.eventdetails'), to: 'Eventdetails', icon: assets.register },
    // { name: t('screens.eventPresta'), to: 'EventPresta', icon: assets.register },

    admin == 1 && { name: 'CLIENTS', to: 'Client', icon: assets.users },
    admin == 1 && {
      name: 'PRESTATAIRES',
      to: 'Prestataire',
      icon: assets.office,
    },
  ].filter(Boolean) // Cela supprime toutes les valeurs `falsy` du tableau

  const handleNewProject = () => {
    navigation.navigate('Screens', { screen: 'Eventdetails' })
  }
  return (
    <DrawerContentScrollView
      {...props}
      scrollEnabled
      removeClippedSubviews
      renderToHardwareTextureAndroid
      contentContainerStyle={{ paddingBottom: sizes.padding }}
    >
      <Block paddingHorizontal={sizes.padding}>
        <Block flex={0} row align="center" marginBottom={sizes.l}>
          <Image
            radius={0}
            width={50}
            height={50}
            source={logo}
            marginRight={sizes.sm / 6}
          />
          <Block>
            <Text size={15} semibold>
              CRM EVENTS
            </Text>
          </Block>
        </Block>

        {screens?.map((screen, index) => {
          const isActive = active === screen.to
          return (
            <Button
              row
              justify="flex-start"
              marginBottom={sizes.s}
              key={`menu-screen-${screen.name}-${index}`}
              onPress={() => handleNavigation(screen.to)}
            >
              <Block
                flex={0}
                radius={6}
                align="center"
                justify="center"
                width={sizes.md}
                height={sizes.md}
                marginRight={sizes.s}
                gradient={gradients[isActive ? 'primary' : 'white']}
              >
                <Image
                  radius={0}
                  width={14}
                  height={14}
                  source={screen.icon}
                  color={colors[isActive ? 'white' : 'black']}
                />
              </Block>
              <Text p semibold={isActive} color={labelColor} size={15}>
                {screen.name}
              </Text>
            </Button>
          )
        })}

        <Block
          flex={0}
          height={1}
          marginRight={sizes.md}
          marginVertical={sizes.sm}
          gradient={gradients.menu}
        />

        {admin == 1 && (
          <Button
            row
            justify="center"
            onPress={handleNewProject}
            gradient={gradients.info}
          >
            <Text p color={colors.white} size={15} center>
              NOUVEAU PROJET +
            </Text>
          </Button>
        )}

        <Button
          row
          justify="flex-start"
          marginTop={sizes.sm}
          marginBottom={sizes.s}
          onPress={Logout}
        >
          <Block
            flex={0}
            radius={6}
            align="center"
            justify="center"
            width={sizes.md}
            height={sizes.md}
            marginRight={sizes.s}
            gradient={gradients.white}
          >
            <LogOut width={14} height={14} color={colors.black} />
          </Block>
          <Text p color={labelColor} size={15}>
            DÉCONNEXION
          </Text>
        </Button>

        <Block row justify="space-between" marginTop={sizes.sm}>
          <Text color={labelColor}> MODE SOMBRE</Text>
          <Switch
            checked={isDark}
            onPress={(checked) => handleIsDark(checked)}
          />
        </Block>
      </Block>
    </DrawerContentScrollView>
  )
}

/* drawer menu navigation */
export default () => {
  const { isDark } = useData()
  const { gradients } = useTheme()

  return (
    <Block gradient={gradients[isDark ? 'dark' : 'light']}>
      <Drawer.Navigator
        screenOptions={{
          drawerType: 'slide',
          overlayColor: 'transparent',
          sceneContainerStyle: { backgroundColor: 'transparent' },
          drawerStyle: {
            flex: 1,
            width: '60%',
            borderRightWidth: 0,
            backgroundColor: 'transparent',
          },
        }}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen
          name="Screens"
          component={ScreensStack}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </Block>
  )
}
