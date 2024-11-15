import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Linking, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import { AuthContext } from '../context/AuthContext';
import {useData, useTheme} from '../hooks/';
import { useForm } from 'react-hook-form';
import * as regex from '../constants/regex';
import {Block, Button, Input, Image, Text, Checkbox} from '../components/';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
};

i18n
.use(initReactI18next)
.init({
  resources: translations,
  lng: 'fr',  // langue par défaut
  fallbackLng: 'fr',
  compatibilityJSON: 'v3', // Utiliser le format de compatibilité v3
  interpolation: {
    escapeValue: false,  // React se charge déjà de l'échappement des valeurs
  },
});

const isAndroid = Platform.OS === 'android';

interface ILogin {
  email: string;
  password: string;
  agreed: boolean;
}
interface ILoginValidation {
  email: boolean;
  password: boolean;
  agreed: boolean;
}

const Login = () => {
  const {isDark} = useData();
  // const {t} = useTranslation();
  const navigation = useNavigation();
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<ILoginValidation>({
    email: false,
    password: false,
    agreed: false,
  });
  const [login, setLoginData] = useState<ILogin>({
    email: '',
    password: '',
    agreed: false,
  });
  const {assets, colors, gradients, sizes} = useTheme();
  const {Login, isloading} = useContext(AuthContext);

  const handleChange = useCallback(
    (value : any) => {
      setLoginData((state) => ({...state, ...value}));
    },
    [setLoginData],
  );

  const handleSignIn = useCallback(() => {
    /** send/save registratin data */
    console.log('handleSignIn', login);
    if(!regex.password.test(login.password)){
      setError('Veuillez entrer un email et un mot de passe correctes!');
      return;
    }else{
      
      Login(login);
    }
  }, [login]);

  useEffect(() => {
    setIsValid((state) => ({
      ...state,
      email: regex.email.test(login.email),
      password: regex.password.test(login.password),
      agreed: login.agreed,
    }));
  }, [login, setIsValid]);

  return (
    <Block safe marginTop={sizes.md}>
      <Block paddingHorizontal={sizes.s}>
        <Block flex={0} style={{zIndex: 0}}>
          <Image
            background
            resizeMode="cover"
            padding={sizes.sm}
            radius={sizes.cardRadius}
            source={assets.background}
            height={sizes.height * 0.3}>
            <Button
              row
              flex={0}
              justify="flex-start"
              onPress={() => navigation.goBack()}>
              {/*<Image
                radius={0}
                width={10}
                height={18}
                color={colors.white}
                source={assets.arrow}
                transform={[{rotate: '180deg'}]}
              />
               <Text p white marginLeft={sizes.s}>
                {"t('common.goBack')"}
              </Text> */}
            </Button>

            <Text h4 center white marginBottom={sizes.md}>
              Bienvenue sur CrmEvents
            </Text>
          </Image>
        </Block>
        {/* login form */}
        <Block
          keyboard
          marginTop={-(sizes.height * 0.2 - sizes.l)}
          behavior={!isAndroid ? 'padding' : 'height'}>
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
              paddingVertical={sizes.sm}>
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
                paddingHorizontal={sizes.xxl}>
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
                  marginBottom={sizes.m}
                  keyboardType="email-address"
                  placeholder="Entrez votre adresse e-mail"
                  success={Boolean(login.email && isValid.email)}
                  danger={Boolean(login.email && !isValid.email)}
                  onChangeText={(value) => handleChange({email: value})}
                />
                <Input
                  secureTextEntry
                  label="Mot de Passe"
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder="Entrer un mot de passe"
                  onChangeText={(value) => handleChange({password: value})}
                  success={Boolean(login.password && isValid.password)}
                  danger={Boolean(login.password && !isValid.password)}
                />
              </Block>
              {/* checkbox terms */}
              <Block row flex={0} align="center" paddingHorizontal={sizes.sm}>
                <Checkbox
                  marginRight={sizes.sm}
                  checked={login?.agreed}
                  onPress={(value) => handleChange({agreed: value})}
                />
                <Text paddingRight={sizes.s}>
                Je suis d'accord avec les 
                  <Text
                    semibold
                    onPress={() => {
                      Linking.openURL('https://www.creative-tim.com/terms');
                    }}> Termes et Conditions
                  </Text>
                </Text>
              </Block>
              <Button
                onPress={handleSignIn}
                //onPress={handleSubmit(Login)}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                gradient={gradients.primary}
                disabled={Object.values(isValid).includes(false)}>
                <Text bold white transform="uppercase">
                S'identifier
                </Text>
              </Button>
              {error !== '' && <Text style={{ color: 'red' }}>{error}</Text>}
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
};

export default Login;
