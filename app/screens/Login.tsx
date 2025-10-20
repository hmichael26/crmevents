import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Platform, View } from 'react-native'
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
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
    })
  }, [loginData])

  // Gestion de la connexion
  const handleSignIn = useCallback(async () => {
    if (!isValid.email || !isValid.password) {
      setError('Veuillez remplir tous les champs correctement.')
      return
    }

    try {
      await Login(loginData)
      // navigation.navigate('Menu') // Redirection après connexion réussie
    } catch (err) {
      // console.log(err)
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
                  width: 160,
                  height: 160,
                  borderRadius: 60,
                }}
              />
            </Block>

            <Text h4 center white marginBottom={sizes.md}>
              Bienvenue sur CrmEvents
            </Text>
          </Image>
        </Block>
        {/* login form */}
        <KeyboardAwareScrollView
          style={{
            marginTop: -(sizes.height * 0.03 - sizes.l),
          }}
        >
          <View
            style={{
              borderRadius: sizes.sm,
              marginHorizontal: 0,
            }}
          >
            <View
              style={{
                borderRadius: sizes.sm,
                overflow: 'hidden',
                justifyContent: 'space-evenly',
                paddingVertical: sizes.sm,
                backgroundColor: 'white',
                // Si vous avez un effet blur, vous devrez utiliser une librairie comme @react-native-community/blur
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 10,
                  fontSize: 27,
                }}
                size={22}
              >
                Connexion
              </Text>

              {/* social buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  marginVertical: 15,
                }}
              >
                {/* Boutons sociaux commentés */}
              </View>

              {/* Divider */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: sizes.sm,
                  paddingHorizontal: sizes.xxl,
                }}
              >
                <View
                  style={{
                    height: 1,
                    width: '50%',
                    backgroundColor: '#e0e0e0', // Remplacer par votre couleur de divider
                  }}
                />
                <View
                  style={{
                    height: 1,
                    width: '50%',
                    backgroundColor: '#e0e0e0',
                  }}
                />
              </View>

              {/* form inputs */}
              <View
                style={{
                  paddingHorizontal: sizes.sm * 2,
                  marginBottom: sizes.sm * 2,
                  gap: 10,
                }}
              >
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
                  style={{ marginVertical: sizes.sm }}
                  label="Mot de Passe"
                  secureTextEntry
                  autoCapitalize="none"
                  placeholder="Entrez votre mot de passe"
                  value={loginData.password}
                  onChangeText={(value) => handleChange({ password: value })}
                  success={Boolean(loginData.password && isValid.password)}
                  danger={Boolean(loginData.password && !isValid.password)}
                />
              </View>

              <Button
                gradient={gradients.primary}
                onPress={handleSignIn}
                disabled={Object.values(isValid).includes(false) || isloading}
                style={{
                  paddingHorizontal: sizes.sm * 2,
                }}
              >
                {isloading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: '#fff',
                      textTransform: 'uppercase',
                    }}
                    white
                  >
                    Se connecter
                  </Text>
                )}
              </Button>

              {error ? (
                <Text
                  style={{
                    color: 'red',
                    textAlign: 'center',
                    marginTop: sizes.s,
                  }}
                >
                  {error}
                </Text>
              ) : null}
            </View>
          </View>
        </KeyboardAwareScrollView>
      </Block>
    </Block>
  )
}

export default Login
