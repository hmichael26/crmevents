import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { AuthContext } from '../context/AuthContext'
import { useData, useTheme } from '../hooks/'
import { useForm } from 'react-hook-form'
import * as regex from '../constants/regex'
import { Block, Button, Input, Image, Text, Checkbox } from '../components/'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Notifications from 'expo-notifications'
import * as Clipboard from 'expo-clipboard'
import Constants from 'expo-constants'
import Toast from 'react-native-toast-message'

const translations = {
  en: {
    translation: {
      'login.title': 'Login Title',
    },
  },
  fr: {
    translation: {
      'login.title': 'Titre de Connexion',
    },
  },
}

i18n.use(initReactI18next).init({
  resources: translations,
  lng: 'fr', // langue par défaut
  fallbackLng: 'fr',
  compatibilityJSON: 'v3', // Utiliser le format de compatibilité v3
  interpolation: {
    escapeValue: false, // React se charge déjà de l'échappement des valeurs
  },
})

const isAndroid = Platform.OS === 'android'

interface ILogin {
  email: string
  password: string
  agreed: boolean
}
interface ILoginValidation {
  email: boolean
  password: boolean
  agreed: boolean
}

const Login = () => {
  const navigation = useNavigation()
  const { assets, colors, gradients, sizes } = useTheme()
  const { Login, isloading } = useContext(AuthContext)

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    agreed: false,
  })
  const [isValid, setIsValid] = useState({
    email: false,
    password: false,
    agreed: false,
  })
  const [error, setError] = useState('')

  // Gestion des changements dans les champs de formulaire
  const handleChange = useCallback((value) => {
    setLoginData((state) => ({ ...state, ...value }))
  }, [])

  // Validation des champs
  useEffect(() => {
    setIsValid({
      email: regex.email.test(loginData.email),
      password: regex.password.test(loginData.password),
      agreed: loginData.agreed,
    })
  }, [loginData])

  // Gestion de la connexion
  const handleSignIn = useCallback(async () => {
    if (!isValid.email || !isValid.password || !isValid.agreed) {
      setError('Veuillez remplir tous les champs correctement.')
      return
    }

    try {
      await Login(loginData)
      // navigation.navigate('Menu') // Redirection après connexion réussie
    } catch (err) {
      setError('Échec de la connexion. Vérifiez vos identifiants.')
    }
  }, [isValid, loginData, Login, navigation])

  return (
    <Block safe marginTop={sizes.md}>
      <Block paddingHorizontal={sizes.s}>
        <Block flex={0} style={{ zIndex: 0 }}>
          <Image
            background
            resizeMode="cover"
            padding={sizes.sm * 1.2}
            radius={sizes.cardRadius}
            source={assets.background}
            height={sizes.height * 0.32}
          >
            <Block
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                source={require('../assets/images/splash.png')}
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 60,
                }}
              />
            </Block>

            <Text
              h4
              center
              white
              marginBottom={sizes.md * 2}
              marginTop={-sizes.sm}
            >
              Bienvenue sur CrmEvents
            </Text>
          </Image>
        </Block>
        {/* login form */}
        <Block
          keyboard
          marginTop={-(sizes.height * 0.13 - sizes.l)}
          behavior={!isAndroid ? 'padding' : 'height'}
        >
          <Block
            flex={0}
            radius={sizes.sm}
            marginHorizontal="8%"
            shadow={!isAndroid} // disabled shadow on Android due to blur overlay + elevation issue
          >
            <Block
              blur
              flex={0}
              // intensity={90}
              radius={sizes.sm}
              overflow="hidden"
              justify="space-evenly"
              paddingVertical={sizes.sm}
            >
              <Text p center white marginTop={26} size={22}>
                Connexion
              </Text>
              {/* social buttons */}
              <Block row center justify="space-evenly" marginVertical={sizes.m}>
                {/* <Button outlined gray shadow={!isAndroid}>
                  <Image
                    source={assets.facebook}
                    height={sizes.m}
                    width={sizes.m}
                    color={isDark ? colors.icon : undefined}
                  />
                </Button>
                <Button outlined gray shadow={!isAndroid}>
                  <Image
                    source={assets.apple}
                    height={sizes.m}
                    width={sizes.m}
                    color={isDark ? colors.icon : undefined}
                  />
                </Button>
                <Button outlined gray shadow={!isAndroid}>
                  <Image
                    source={assets.google}
                    height={sizes.m}
                    width={sizes.m}
                    color={isDark ? colors.icon : undefined}
                  />
                </Button> */}
              </Block>
              <Block
                row
                flex={0}
                align="center"
                justify="center"
                marginBottom={sizes.sm}
                paddingHorizontal={sizes.xxl}
              >
                <Block
                  flex={0}
                  height={1}
                  width="50%"
                  end={[1, 0]}
                  start={[0, 1]}
                  gradient={gradients.divider}
                />
                {/* <Text center marginHorizontal={sizes.s}>
                  {"t('common.or')"}
                </Text> */}
                <Block
                  flex={0}
                  height={1}
                  width="50%"
                  end={[0, 1]}
                  start={[1, 0]}
                  gradient={gradients.divider}
                />
              </Block>
              {/* form inputs */}
              <Block paddingHorizontal={sizes.sm}>
                <Input
                  label="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Entrez votre adresse e-mail"
                  value={loginData.email}
                  onChangeText={(value) => handleChange({ email: value })}
                  success={Boolean(loginData.email && isValid.email)}
                  danger={Boolean(loginData.email && !isValid.email)}
                />
                <Input
                  label="Mot de Passe"
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="Entrez votre mot de passe"
                  value={loginData.password}
                  onChangeText={(value) => handleChange({ password: value })}
                  success={Boolean(loginData.password && isValid.password)}
                  danger={Boolean(loginData.password && !isValid.password)}
                />
              </Block>
              {/* checkbox terms */}
              {/* Checkbox des termes et conditions */}
              <Block
                row
                align="center"
                marginVertical={sizes.sm}
                marginHorizontal={sizes.sm}
              >
                <Checkbox
                  marginRight={sizes.sm}
                  checked={loginData.agreed}
                  onPress={(value) => handleChange({ agreed: value })}
                />
                <Text>
                  J'accepte les{' '}
                  <Text
                    semibold
                    onPress={() =>
                      Linking.openURL('https://www.example.com/terms')
                    }
                  >
                    Termes et Conditions
                  </Text>
                </Text>
              </Block>
              <Button
                gradient={gradients.primary}
                onPress={handleSignIn}
                disabled={Object.values(isValid).includes(false) || isloading}
              >
                {isloading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text bold white transform="uppercase">
                    Se connecter
                  </Text>
                )}
              </Button>

              {error ? (
                <Text color="red" center marginTop={sizes.s}>
                  {error}
                </Text>
              ) : null}
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

export default Login
