import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react'
import {
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { AuthContext } from '../context/AuthContext'
import { useTheme } from '../hooks/'
import * as regex from '../constants/regex'
import { Button } from '../components/' // Seul composant personnalisé gardé
import Toast from 'react-native-toast-message'

const { width, height } = Dimensions.get('window')
const isAndroid = Platform.OS === 'android'

// Types
interface ILoginData {
  email: string
  password: string
  agreed: boolean
}

interface IValidationState {
  email: boolean
  password: boolean
  agreed: boolean
}

interface IErrorState {
  message: string
  type: 'validation' | 'network' | 'auth'
}

const Login: React.FC = () => {
  const navigation = useNavigation()
  const { colors, gradients, sizes } = useTheme()
  const { Login: authLogin, isloading } = useContext(AuthContext)

  // États du composant
  const [loginData, setLoginData] = useState<ILoginData>({
    email: '',
    password: '',
    agreed: false,
  })

  const [isValid, setIsValid] = useState<IValidationState>({
    email: false,
    password: false,
    agreed: false,
  })

  const [error, setError] = useState<IErrorState | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Validation memoized
  const validationState = useMemo(() => {
    return {
      email: regex.email.test(loginData.email),
      password: regex.password.test(loginData.password),
      agreed: loginData.agreed,
    }
  }, [loginData.email, loginData.password, loginData.agreed])

  // Mise à jour de l'état de validation
  useEffect(() => {
    setIsValid(validationState)
    if (
      error?.type === 'validation' &&
      Object.values(validationState).every(Boolean)
    ) {
      setError(null)
    }
  }, [validationState, error])

  // Gestion des changements
  const handleChange = useCallback(
    (field: keyof ILoginData, value: any) => {
      setLoginData((prev) => ({ ...prev, [field]: value }))
      if (error) {
        setError(null)
      }
    },
    [error],
  )

  // Gestion de la connexion
  const handleSignIn = useCallback(async () => {
    try {
      if (
        !validationState.email ||
        !validationState.password ||
        !validationState.agreed
      ) {
        setError({
          message: 'Veuillez remplir tous les champs correctement.',
          type: 'validation',
        })
        return
      }

      const result = await authLogin(loginData)

      if (result?.success) {
        Toast.show({
          type: 'success',
          text1: 'Connexion réussie',
          text2: 'Bienvenue !',
        })
        navigation.navigate('Menu')
      } else {
        throw new Error(result?.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)

      let errorMessage = 'Échec de la connexion. Vérifiez vos identifiants.'
      let errorType: IErrorState['type'] = 'auth'

      if (err.message?.includes('network') || err.code === 'NETWORK_ERROR') {
        errorMessage = 'Erreur réseau. Veuillez réessayer.'
        errorType = 'network'
      }

      setError({
        message: errorMessage,
        type: errorType,
      })

      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: errorMessage,
      })
    }
  }, [validationState, loginData, authLogin, navigation])

  // Gestion des termes et conditions
  const handleTermsPress = useCallback(() => {
    Linking.openURL('https://www.example.com/terms').catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir le lien")
    })
  }, [])

  // État du bouton
  const isButtonDisabled = useMemo(() => {
    return !Object.values(validationState).every(Boolean) || isloading
  }, [validationState, isloading])

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={isAndroid ? 'height' : 'padding'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.safeArea}>
          {/* Header avec logo */}

          <Image
            source={require('../assets/images/background.png')} // Remplacez par votre logo
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '40%',
              borderRadius: 30,
            }}
            resizeMode="cover"
          />
          <View style={styles.header}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/splash.png')} // Remplacez par votre logo
                style={styles.logo}
                resizeMode="cover"
              />
            </View>

            {/* Titre */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.white }]}>
                Bienvenue sur CrmEvents
              </Text>
              <Text style={[styles.subtitle, { color: colors.white }]}>
                Connectez-vous pour continuer
              </Text>
            </View>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: loginData.email
                        ? validationState.email
                          ? colors.success
                          : colors.danger
                        : colors.gray,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Entrez votre adresse e-mail"
                  placeholderTextColor={colors.gray}
                  value={loginData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Mot de passe
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.passwordInput,
                      {
                        borderColor: loginData.password
                          ? validationState.password
                            ? colors.success
                            : colors.danger
                          : colors.gray,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Entrez votre mot de passe"
                    placeholderTextColor={colors.gray}
                    value={loginData.password}
                    onChangeText={(value) => handleChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={[styles.eyeText, { color: colors.primary }]}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Checkbox termes */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: loginData.agreed
                        ? colors.primary
                        : 'transparent',
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleChange('agreed', !loginData.agreed)}
                >
                  {loginData.agreed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={[styles.termsText, { color: colors.text }]}>
                    J'accepte les{' '}
                    <Text
                      style={[styles.termsLink, { color: colors.primary }]}
                      onPress={handleTermsPress}
                    >
                      Termes et Conditions
                    </Text>
                  </Text>
                </View>
              </View>

              {/* Message d'erreur */}
              {error && (
                <View
                  style={[
                    styles.errorContainer,
                    { backgroundColor: colors.danger + '20' },
                  ]}
                >
                  <Text style={[styles.errorText, { color: colors.danger }]}>
                    {error.message}
                  </Text>
                </View>
              )}

              {/* Bouton de connexion */}
              <Button
                gradient={gradients.primary}
                onPress={handleSignIn}
                disabled={isButtonDisabled}
                style={styles.loginButton}
              >
                {isloading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>SE CONNECTER</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 60,
    marginTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeText: {
    fontSize: 18,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    height: 50,
    borderRadius: 12,
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default Login
