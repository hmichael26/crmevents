import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, ScrollView, Keyboard, Platform, Animated, PixelRatio } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons'; // Remplacez 'Ionicons' par l'icône de votre choix
import Select from 'react-select'

import { useTheme } from '../hooks';
import { Block, Button, Input, Image, Switch, Modal, Text } from '../components';
import { SwitchTextBox, TextInputWithIcon } from '../components/TextInputWithIcon';
import MultiSelect from '../components/MultiSelectBox';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Form4 from '../components/EventForm4';
import Form5 from '../components/EventForm5';
import { AuthContext } from '../context/AuthContext';
import { useApi } from '../context/useApi';
// import { Container } from './styles';
const { width, height } = Dimensions.get('window');
const options = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
  // Add more options as needed
];
const fontScale = PixelRatio.getFontScale();

const EventPresta: React.FC = ({ route }) => {
  const { item } = route.params; // Récupérer l'item depuis les paramètres
  //console.log(item.id)
  const { getDerouler } = useApi();
  const [data0, setData0] = React.useState([]);



  const { userdata, validForm } = useContext(AuthContext);
  const eventTypes = userdata.list_champ_dyn;
  //console.log(eventTypes)

  const options = eventTypes?.map((libelle, index) => ({
    id: index + 1,
    libelle
  }));
  console.log(options)
  const getButtonSize = () => {
    const buttonWidth = width * 0.3; // 30% de la largeur de l'écran
    const buttonHeight = height * 0.06; // 6% de la hauteur de l'écran
    return { width: buttonWidth, height: buttonHeight };
  };

  const getFontSize = (size: number) => size / fontScale;

  const { assets, colors, gradients, sizes } = useTheme();
  const [step, setStep] = useState("deroule");
  const [data, setData] = React.useState([]);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Valeur d'animation initiale
  const [derouleTitle, setDerouleTitle] = useState("");

  const [formData, setFormData] = useState({
    derouleTitle: '',
    fields: []
  });

  useEffect(() => {
    if (item) {
      getDerouler({ id_deroule: item.id }).then(response => {
        setData0(response.data);
      });
    }
  }, [item]);

  // console.log(data0)
  const handleDerouleTitleChange = (title: string) => {
    setDerouleTitle(title);
    // Mettre à jour formData avec le nouveau titre
    setFormData(prevData => ({
      ...prevData,
      derouleTitle: title
    }));
  };

  const handleForm5DataChange = (data: any) => {
    setFormData(prevData => ({
      ...prevData,
      fields: data.fields
    }));
  };

  const handleSaveForm = () => {
    Alert.alert(
      "Données du formulaire",
      JSON.stringify(formData, null, 2),
      [{ text: "OK" }]
    );
    validForm({ data: formData });

  };

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
      {
        item?.titre_deroule ? (<Button gradient={gradients.primary} marginBottom={sizes.base} >
          <Text white transform="uppercase" size={20}>
            {item.titre_deroule}
          </Text>
        </Button>) : (<Button gradient={gradients.primary} marginBottom={sizes.base} >
          <Text white transform="uppercase" size={20}>
            {derouleTitle ? derouleTitle : "Ajouter un deroulé"}
          </Text>
        </Button>)
      }



      <View style={{ flexDirection: "row", justifyContent: "space-around", gap: 10, marginHorizontal: 5, marginVertical: 10 }}>
        <Button flex={0.4} gradient={gradients.secondary} marginBottom={sizes.base} rounded={true} round={false} style={{ borderColor: "#000" }} onPress={() => setStep("deroule")}>
          <Text white transform="uppercase" size={15}  >
            Déroulé
          </Text>
        </Button>
        <Button flex={1} gradient={gradients.info} marginBottom={sizes.base} rounded={false} round={false} onPress={() => setStep("Presta")}>
          <Text white transform="uppercase" size={15}>
            Prestataires interrogés
          </Text>
        </Button>

      </View>
    </View>

    {
      step === "deroule" && item?.titre_deroule === undefined && <View style={{ borderColor: "#ccc", borderWidth: 1, padding: 10, borderRadius: 10, marginHorizontal: 30 }}>

        <TextInput
          style={{
            color: 'black',
            fontSize: 18,
            textTransform: 'uppercase',
            width: '100%',
            textAlign: "center",
          }}
          placeholder="saisissez le titre de votre deroule"
          placeholderTextColor="#000"
          value={derouleTitle}
          onChangeText={handleDerouleTitleChange}
        />

      </View>

    }


    <ScrollView style={{ flex: 1, paddingBottom: 25 }} contentContainerStyle={styles.scrollViewContent}>
      {step === "deroule" && <Form5 options={options} onDataChange={handleForm5DataChange} item={data0?.fields} />}
      {step === "Presta" && <Form4 item={data0} />}
    </ScrollView>

    {
      !isKeyboardVisible && (
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 20, marginBottom: -15 }}>

            <Button flex={1} gradient={gradients.secondary} marginBottom={sizes.base / 1.5} rounded={false} round={false} height={35}>
              <Text white size={getFontSize(13)} bold >
                Retour
              </Text>

            </Button>
            <Button flex={1} gradient={gradients.warning} marginBottom={sizes.base / 1.5} rounded={false} round={false} height={35} onPress={handleSaveForm}>
              <Text white bold transform="uppercase" size={getFontSize(13)}>
                Sauvegarder
              </Text>
            </Button>
            <Button flex={1} gradient={gradients.info} marginBottom={sizes.base / 1.5} rounded={false} round={false} height={35}>
              <Text white bold transform="uppercase" size={getFontSize(13)}>
                CHat
              </Text>
            </Button>

          </View>
        </Animated.View>)
    }
  </SafeAreaView >;
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1

  }, scrollViewContent: {
    padding: 6,
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
export default EventPresta;