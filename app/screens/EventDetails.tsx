import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, ScrollView, Keyboard, Platform, Animated, PixelRatio } from 'react-native';
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
import { RouteProp, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

type RootStackParamList = {
  EventDetails: { item: ItemType };  // Définir les paramètres de l'écran
};

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

interface ItemType {
  evt: string;
  id: number;
  ref: number;
  name: string;
  description: string;
}

interface EventDetailsProps {
  route: EventDetailsRouteProp;  // Déclarer la route avec son type
}
// import { Container } from './styles';
const { width, height } = Dimensions.get('window');
const options = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
  // Add more options as needed
];


type FormData1 = {
  idevt?:Number;
  evt?: string;
  date_reception?: any;
  ref?: string;
  pax?: string;
  zone?: string;
  types_evts?: any;
  date_deb?: any;
  date_fin?:  any;
  flexible_dates?: boolean;
  budget?: string;
  commentaires_dates?: string;
  format?: string;
};

type FormData2 = {
  idevt?:Number;
  clt?: string;
  ent?: string;
  clt_email?: string;
  clt_telfix?: string;
  clt_telport?: string;
  clt_infos?: string;
  publish_as_company?: any;
  clients?: object[];
};

type FormData3 = {
  idevt?:Number;
  commission_10?: boolean;
  commission_12?: boolean;
  commission_15?: boolean;
};

const fontScale = PixelRatio.getFontScale();

const EventDetails: React.FC<EventDetailsProps> = ({ route }) => {
  const { userdata,validForm } = useContext(AuthContext);


  const eventTypes = userdata.all_types_evts;
  // console.log(eventTypes)
  const { item } = route.params; // Récupérer l'item depuis les paramètres
  const navigation = useNavigation();

  // console.log(item)



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
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [formData, setFormData] = useState<FormData1>({});
  const [formData2, setFormData2] = useState<FormData2>({});
  const [formData3, setFormData3] = useState<FormData3>({});
 


  const FormIds =  (data: any) => {
    if(data){
      return  data.map((item: any) => item.id).join(",");
    }
    return '';
  }
   



  const handleForm5DataChange = (data: any,type:string) => {
    if(type==='form2'){
      setFormData2(prevData => ({
        ...prevData,
        ...data
      }));
      return
    }
    if(type==='form3'){
      setFormData3(prevData => ({
        ...prevData,
        ...data
      }));
      return
    } 
    setFormData(prevData => ({
      ...prevData,
      ...data
    }));
  };

 
  const createFormDataObject = (
    formData:FormData1,
    formData2: FormData2,
    formData3: FormData3
  ): Record<string, any> | null => {
    // Vérifiez si toutes les sources sont valides
    if (!formData || !formData2 || !formData3) {
      return null;
    }
  
    const combinedData: Record<string, any> = {
      idevt: formData.idevt,
      nom: formData.evt,
      date_reception: formData.date_reception,
      ref: formData.ref,
      pax: formData.pax,
      zone: formData.zone,
      types_evts: formData.types_evts,
      date_deb: formData.date_deb,
      date_fin: formData.date_fin,
      flexible_dates: formData.flexible_dates,
      budget: formData.budget,
      commentaires_dates: formData.commentaires_dates,
      format: formData.format,
      fk_client: formData2.clt,
      fk_entreprise: formData2.ent,
      email: formData2.clt_email,
      tel_fixe: formData2.clt_telfix,
      tel_port: formData2.clt_telport,
      infos: formData2.clt_infos,
      afficher_nom_client: formData2.publish_as_company,
      "10pourcent": formData3.commission_10,
      "12pourcent": formData3.commission_12,
      "15pourcent": formData3.commission_15,
      clients: FormIds(formData2.clients),
    };
  
    // Supprimer les clés avec des valeurs nulles ou indéfinies
    Object.keys(combinedData).forEach(
      (key) =>
        (combinedData[key] === null || combinedData[key] === undefined) &&
        delete combinedData[key]
    );
  
    return combinedData;
  };
  
  // Utilisation de la fonction
  const formDataObj = createFormDataObject(formData, formData2, formData3);
     
 
   
  
  const createFormData = (data: Record<string, any>): any => {
    const formData = new FormData();
  
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Sérialiser les objets ou tableaux
        if (typeof value === "object" && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });
  
    return formData;
  };
  
  
  const handleSaveForm = () => {

     validForm(formDataObj);
   
    Alert.alert(
      "Données du formulaire",
      JSON.stringify(formDataObj, null, 2),
      [{ text: "OK" }]
    );
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
      <Button gradient={gradients.primary} marginBottom={sizes.base} >
        <Text white transform="uppercase" size={18}>
          Détails de l'Event {item.ref}
        </Text>
      </Button>

      <View style={{ flexDirection: "row", justifyContent: "space-around", gap: 10, marginHorizontal: 5, marginVertical: 10 }}>
        <Button flex={1} gradient={gradients.secondary} marginBottom={sizes.base} rounded={true} round={false} style={{ borderColor: "#000" }} onPress={() => setStep("date")}>
          <Text white transform="uppercase" size={15}  >
            Dates
          </Text>
        </Button>
        <Button flex={1} gradient={gradients.info} marginBottom={sizes.base} rounded={false} round={false} onPress={() => setStep("clients")}>
          <Text white transform="uppercase" size={15}>
            Clients
          </Text>
        </Button>
        <Button flex={1} gradient={gradients.success} marginBottom={sizes.base} rounded={false} round={false} onPress={() => setStep("com")}>
          <Text white transform="uppercase" size={15}>
            COM %
          </Text>
        </Button>
      </View>
    </View>




    <ScrollView style={{ flex: 1, paddingBottom: 25 }} contentContainerStyle={styles.scrollViewContent}>

      {step === "date" && <Form1 item={item} eventTypes={eventTypes} onDataChange={handleForm5DataChange}   />}
      {step === "clients" && <Form2 item={item} onDataChange={handleForm5DataChange} clients={formData?.clients} clientData={userdata.all_clts} />}
      {step === "com" && <Form3 item={item}  onDataChange={handleForm5DataChange} />}


    </ScrollView>




    {!isKeyboardVisible && (
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 20 }}>

          <Button flex={1} gradient={gradients.secondary} marginBottom={sizes.base} rounded={false} round={false} onPress={() => navigation.goBack()}>
            <Text white transform="uppercase" size={getFontSize(13)}>
              Retour
            </Text>
          </Button>
          <Button flex={1} gradient={gradients.warning} marginBottom={sizes.base} rounded={false} round={false} onPress={handleSaveForm}>
            <Text white transform="uppercase" size={getFontSize(13)}>
              Sauvegarder
            </Text>
          </Button>
          <Button flex={1} gradient={gradients.info} marginBottom={sizes.base} rounded={false} round={false}>
            <Text white transform="uppercase" size={getFontSize(13)}>
              Chat
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