import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, ScrollView, Keyboard, Platform, Animated,PixelRatio } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons'; // Remplacez 'Ionicons' par l'icône de votre choix
import Select from 'react-select'

import { useTheme } from '../hooks/';
import { Block, Button, Input, Image, Switch, Modal, Text } from '../components/';
import { SwitchTextBox, TextInputWithIcon } from '../components/TextInputWithIcon';
import MultiSelect from '../components/MultiSelectBox';
import form1 from '../components/EventForm1';
import Form1 from '../components/EventForm1';
import Form2 from '../components/EventForm2';
import Form3 from '../components/EventForm3';
// import { Container } from './styles';
const { width, height } = Dimensions.get('window');
const options = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
  // Add more options as needed
];
const fontScale = PixelRatio.getFontScale();

const EventDetails: React.FC = () => {
  const getButtonSize = () => {
    const buttonWidth = width * 0.3; // 30% de la largeur de l'écran
    const buttonHeight = height * 0.06; // 6% de la hauteur de l'écran
    return { width: buttonWidth, height: buttonHeight };
  };
  
  const getFontSize = (size: number) => size / fontScale;

  const { assets, colors, gradients, sizes } = useTheme();
  const [step, setStep] = useState("date");
  const [data, setData] = React.useState([]);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Valeur d'animation initiale

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 0, // Disparaît
          duration: 300, // Durée de l'animation en ms
          useNativeDriver: true,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(fadeAnim, {
          toValue: 1, // Réapparaît
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setKeyboardVisible(false);
        });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [fadeAnim]);


  return <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", marginTop: -sizes.sm, flexDirection: "column" }}>

    <View style={{ marginHorizontal: 30 }}>
      <Button gradient={gradients.primary} marginBottom={sizes.base} >
        <Text white bold transform="uppercase" size={20}>
          Détails de l'Event
        </Text>
      </Button>

      <View style={{ flexDirection: "row", justifyContent: "space-around", gap: 10, marginHorizontal: 5, marginVertical: 10 }}>
        <Button flex={1} gradient={gradients.secondary} marginBottom={sizes.base} rounded={true} round={false} style={{ borderColor: "#000" }} onPress={() => setStep("date")}>
          <Text white bold transform="uppercase" size={15}  >
            Dates
          </Text>
        </Button>
        <Button flex={1} gradient={gradients.info} marginBottom={sizes.base} rounded={false} round={false} onPress={() => setStep("clients")}>
          <Text white bold transform="uppercase" size={15}>

            CLients
          </Text>
        </Button>
        <Button flex={1} gradient={gradients.success} marginBottom={sizes.base} rounded={false} round={false} onPress={() => setStep("com")}>
          <Text white bold transform="uppercase" size={15}>
            COM %
          </Text>
        </Button>
      </View>
    </View>




    <ScrollView style={{ flex: 1, paddingBottom: 25 }} contentContainerStyle={styles.scrollViewContent}>
     
        {step === "date" && <Form1 />}
        {step === "clients" && <Form2 />}
        {step === "com" && <Form3 />}
    

    </ScrollView>




    {!isKeyboardVisible && (
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 20 }}>

          <Button flex={1} gradient={gradients.secondary} marginBottom={sizes.base} rounded={false} round={false} >
            <Text white size={getFontSize(13)} bold >
              Accueil projet
            </Text>
            <Text white size={getFontSize(13)} bold>
              980
            </Text>
          </Button>
          <Button flex={1} gradient={gradients.warning} marginBottom={sizes.base} rounded={false} round={false}>
            <Text white bold transform="uppercase" size={getFontSize(13)}>
              Sauvegarder
            </Text>
          </Button>
          <Button flex={1} gradient={gradients.info} marginBottom={sizes.base} rounded={false} round={false}>
            <Text white bold transform="uppercase" size={getFontSize(13)}>
              CHat
            </Text>
          </Button>

        </View> 
      </Animated.View>)}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1

  }, scrollViewContent: {
    padding: 15,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    height: height * 0.054,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 4,
    marginBottom: 16,
    borderRadius: 10,
    padding: 10,




  },
  inputContainer: {


    flexDirection: 'row',
    justifyContent: 'center', // Espacement égal entre les éléments
    alignItems: 'center',
    paddingHorizontal: 0, // Ajout de marges pour ne pas coller les TextInputs aux bords
    width: "100%",
    gap: 4
  },
  footer: {

    position: "relative",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 18,
  }, button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: "center"
  },
})
export default EventDetails;