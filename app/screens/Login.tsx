import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { AuthContext } from '../context/AuthContext'
import { useTheme } from '../hooks/'
import * as regex from '../constants/regex'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

const { height, width } = Dimensions.get('window')
const isAndroid = Platform.OS === 'android'

interface ILoginValidation {
  email: boolean
  password: boolean
  agreed: boolean
}

const Login = () => {
  const navigation = useNavigation()
  const { colors, gradients, sizes } = useTheme()
  const { Login, isloading } = useContext(AuthContext)

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    agreed: false,
  })
  const [isValid, setIsValid] = useState<ILoginValidation>({
    email: false,
    password: false,
    agreed: false,
  })
  const [error, setError] = useState('')

  const handleChange = useCallback((value: Partial<typeof loginData>) => {
    setLoginData((state) => ({ ...state, ...value }))
  }, [])

  useEffect(() => {
    setIsValid({
      email: regex.email.test(loginData.email),
      password: regex.password.test(loginData.password),
      agreed: loginData.agreed,
    })
  }, [loginData])

  const handleSignIn = useCallback(async () => {
    if (!isValid.email || !isValid.password || !isValid.agreed) {
      setError('Veuillez remplir tous les champs correctement.')
      return
    }

    try {
      await Login(loginData)
    } catch (err) {
      setError('Échec de la connexion. Vérifiez vos identifiants.')
    }
  }, [isValid, loginData, Login])

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={isAndroid ? 'height' : 'padding'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header avec image de fond */}
        <LinearGradient colors={gradients.primary} style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/splash.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.welcomeText}>Bienvenue sur CrmEvents</Text>
        </LinearGradient>

        {/* Formulaire de connexion */}
        <View style={styles.formContainer}>
          <BlurView intensity={90} style={styles.blurCard}>
            <View style={styles.card}>
              <Text style={styles.title}>Connexion</Text>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    loginData.email && isValid.email && styles.inputSuccess,
                    loginData.email && !isValid.email && styles.inputDanger,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Entrez votre adresse e-mail"
                    placeholderTextColor="#999"
                    value={loginData.email}
                    onChangeText={(value) => handleChange({ email: value })}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de Passe</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    loginData.password &&
                      isValid.password &&
                      styles.inputSuccess,
                    loginData.password &&
                      !isValid.password &&
                      styles.inputDanger,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder="Entrez votre mot de passe"
                    placeholderTextColor="#999"
                    value={loginData.password}
                    onChangeText={(value) => handleChange({ password: value })}
                  />
                </View>
              </View>

              {/* Checkbox Terms */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleChange({ agreed: !loginData.agreed })}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    loginData.agreed && styles.checkboxChecked,
                  ]}
                >
                  {loginData.agreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  J'accepte les{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() =>
                      Linking.openURL(
                        'https://myappcrm.com/termes-conditions.php',
                      )
                    }
                  >
                    Termes et Conditions
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleSignIn}
                disabled={Object.values(isValid).includes(false) || isloading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    Object.values(isValid).includes(false) || isloading
                      ? ['#ccc', '#aaa']
                      : gradients.primary || ['#667eea', '#764ba2']
                  }
                  style={styles.button}
                >
                  {isloading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>SE CONNECTER</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: height * 0.35,
    paddingTop: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    marginTop: -50,
    paddingHorizontal: 20,
  },
  blurCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    marginBottom: 24,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  inputSuccess: {
    borderColor: '#34c759',
  },
  inputDanger: {
    borderColor: '#ff3b30',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
})

export default Login
