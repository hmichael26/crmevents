import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Platform,
  Animated,
  PixelRatio,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons"; // Remplacez 'Ionicons' par l'icône de votre choix
import Select from "react-select";

import { useTheme } from "../hooks/";
import {
  Block,
  Button,
  Input,
  Image,
  Switch,
  Modal,
  Text,
} from "../components/";
import {
  SwitchTextBox,
  TextInputWithIcon,
} from "../components/TextInputWithIcon";
import MultiSelect from "../components/MultiSelectBox";
import form1 from "../components/EventForm1";
import Form1 from "../components/EventForm1";
import Form2 from "../components/EventForm2";
import Form3 from "../components/EventForm3";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/ToastComponent";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type RootStackParamList = {
  EventDetails: { item?: ItemType }; // item devient optionnel
};

type EventDetailsRouteProp = RouteProp<RootStackParamList, "EventDetails">;

interface ItemType {
  idevt?: number;
  evt?: string;
  id?: number;
  ref?: number | string;
  name?: string;
  description?: string;
  date_reception?: any;
  pax?: string;
  zone?: string;
  types_evts?: any;
  date_deb?: any;
  date_fin?: any;
  flexible_dates?: boolean;
  budget?: string;
  commentaires_dates?: string;
  format?: string;
  clt?: string;
  ent?: string;
  clt_email?: string;
  clt_telfix?: string;
  clt_telport?: string;
  clt_infos?: string;
  afficher_nom_client?: any;
  list_clients?: any[];
  commission_10?: boolean;
  commission_12?: boolean;
  commission_15?: boolean;
}

interface EventDetailsProps {
  route: EventDetailsRouteProp; // Déclarer la route avec son type
}
// import { Container } from './styles';
const { width, height } = Dimensions.get("window");
const options = [
  { id: "1", label: "Option 1" },
  { id: "2", label: "Option 2" },
  { id: "3", label: "Option 3" },
  // Add more options as needed
];

type FormData1 = {
  idevt?: Number;
  evt?: string;
  date_reception?: any;
  ref?: string;
  pax?: string;
  zone?: string;
  types_evts?: any;
  date_deb?: any;
  date_fin?: any;
  flexible_dates?: boolean;
  budget?: string;
  commentaires_dates?: string;
  format?: string;
};

type FormData2 = {
  idevt?: Number;
  clt?: string;
  ent?: string;
  clt_email?: string;
  clt_telfix?: string;
  clt_telport?: string;
  clt_infos?: string;
  afficher_nom_client?: any;
  clients?: object[];
};

type FormData3 = {
  idevt?: Number;
  commission_10?: boolean;
  commission_12?: boolean;
  commission_15?: boolean;
};

const fontScale = PixelRatio.getFontScale();

const EventDetails: React.FC<EventDetailsProps> = ({ route }) => {
  const [isSaving, setIsSaving] = useState(false);

  const { userdata, validForm, getUserData } = useContext(AuthContext);
  const { showToast, ToastComponent } = useToast();

  const eventTypes = userdata.all_types_evts;

  // Récupérer l'item des paramètres de route (peut être undefined)
  const item = route?.params?.item || null;

  // Déterminer si on est en mode création ou édition
  const isCreatingNew = !item || !item.idevt;

  const eventRef = item?.ref || "Nouveau";

  // console.log('Item:', item)
  // console.log('Mode création:', isCreatingNew)

  const navigation = useNavigation();

  // Helper function to convert date-like input to Date object
  const parseDate = (date?: Date | string): Date => {
    if (date instanceof Date) return date;
    if (typeof date === "string") {
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    return new Date();
  };

  const parseSelectedIds = (typesEvts: string | null | undefined): string[] => {
    // Cas null ou undefined
    if (!typesEvts) return [];

    return typesEvts
      .split(",") // Sépare les éléments par la virgule
      .map((id) => id.trim()) // Enlève les espaces autour de chaque élément
      .filter((id) => id !== ""); // Supprime les éléments vides
  };

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

  const convertExistingClientsToFormat = (clients: any[]) => {
    if (!clients || !Array.isArray(clients)) return [];
    return clients.map((client) => ({
      id: parseInt(client.id_client),
      nom: `${client.prenom_client} ${client.nom_client}`.trim(),
    }));
  };

  // Valeurs par défaut pour un nouvel événement
  const getDefaultFormData1 = (): FormData1 => ({
    idevt: 0, // Fixé à 0 pour la création
    evt: "",
    date_reception: new Date(),
    ref: "",
    pax: "",
    zone: "",
    types_evts: [],
    date_deb: null,
    date_fin: null,
    flexible_dates: false,
    budget: "",
    commentaires_dates: "",
    format: "",
  });

  const getDefaultFormData2 = (): FormData2 => ({
    idevt: 0, // Fixé à 0 pour la création
    clt: "",
    ent: "",
    clt_email: "",
    clt_telfix: "",
    clt_telport: "",
    clt_infos: "",
    afficher_nom_client: false,
    clients: [],
  });

  const getDefaultFormData3 = (): FormData3 => ({
    idevt: 0, // Fixé à 0 pour la création
    commission_10: false,
    commission_12: false,
    commission_15: false,
  });

  //  console.log(item)

  const [formData, setFormData] = useState<FormData1>(() => {
    if (item && !isCreatingNew) {
      return {
        idevt: item?.idevt || 0,
        evt: item.evt || "",
        date_reception:
          item.date_reception instanceof Date
            ? item.date_reception
            : item.date_reception
            ? parseDate(item.date_reception)
            : null,
        ref: item.ref?.toString() || "",
        pax: item.pax || "",
        zone: item.zone || "",
        types_evts: Array.isArray(item?.types_evts)
          ? item.types_evts
          : item.types_evts
          ? parseSelectedIds(item?.types_evts)
          : [],
        date_deb:
          item.date_deb instanceof Date
            ? item.date_deb
            : item.date_deb
            ? parseDate(item.date_deb)
            : null,
        date_fin:
          item.date_fin instanceof Date
            ? item.date_fin
            : item.date_fin
            ? parseDate(item.date_fin)
            : null,
        flexible_dates: item.flexible_dates || false,
        budget: item.budget || "",
        commentaires_dates: item.commentaires_dates || "",
        format: item.format || "",
      };
    }
    return getDefaultFormData1();
  });

  const [formData2, setFormData2] = useState<FormData2>(() => {
    if (item && !isCreatingNew) {
      return {
        idevt: item.idevt || undefined,
        clt: item.clt || "",
        ent: item.ent || "",
        clt_email: item.clt_email || "",
        clt_telfix: item.clt_telfix || "",
        clt_telport: item.clt_telport || "",
        clt_infos: item.clt_infos || "",
        afficher_nom_client: item.afficher_nom_client || false,
        clients: convertExistingClientsToFormat(item.list_clients) || [],
      };
    }
    return getDefaultFormData2();
  });

  const [formData3, setFormData3] = useState<FormData3>(() => {
    if (item && !isCreatingNew) {
      return {
        idevt: item.idevt || undefined,
        commission_10: item.commission_10 || false,
        commission_12: item.commission_12 || false,
        commission_15: item.commission_15 || false,
      };
    }
    return getDefaultFormData3();
  });

  //  console.log(isCreatingNew, item, formData)

  const FormIds = (data: any) => {
    if (data) {
      return data.map((item: any) => item.id).join(",");
    }
    return "";
  };

  const handleForm5DataChange = (data: any, type: string) => {
    if (type === "form2") {
      setFormData2((prevData) => ({
        ...prevData,
        ...data,
      }));
      return;
    }
    if (type === "form3") {
      setFormData3((prevData) => ({
        ...prevData,
        ...data,
      }));
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      ...data,
    }));
  };

  const createFormDataObject = (
    formData: FormData1,
    formData2: FormData2,
    formData3: FormData3
  ): Record<string, any> | null => {
    // Vérifiez si toutes les sources sont valides
    if (!formData || !formData2 || !formData3) {
      return null;
    }

    const combinedData: Record<string, any> = {
      // Pour la création, on fixe idevt à 0, sinon on utilise l'ID existant
      idevt: isCreatingNew ? 0 : formData.idevt,
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
      afficher_nom_client: formData2.afficher_nom_client,
      commission_10: formData3.commission_10,
      commission_12: formData3.commission_12,
      commission_15: formData3.commission_15,
      clients: FormIds(formData2.clients),
    };

    // Supprimer les clés avec des valeurs nulles ou indéfinies (sauf idevt pour la création)
    Object.keys(combinedData).forEach((key) => {
      if (
        key !== "idevt" &&
        (combinedData[key] === null || combinedData[key] === undefined)
      ) {
        delete combinedData[key];
      }
    });

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

  const handleSaveForm = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);

      // Validation : le nom est obligatoire en mode création
      if (isCreatingNew && (!formData.evt || formData.evt.trim() === "")) {
        showToast("❌ Le nom de l'événement est obligatoire", "error");
        return;
      }

      /*  // Validation : le nom est obligatoire en mode édition aussi
    if (!formData.evt || formData.evt.trim() === '') {
      showToast("❌ Le nom de l'événement est obligatoire", 'error')
      return
    }*/

      //console.log(formDataObj)

      // Appel de la fonction de validation/sauvegarde
      const response = await validForm(formDataObj);

      // Affichage du toast de succès seulement après validation réussie
      const actionText = isCreatingNew ? "créé" : "modifié";
      showToast(`✅ Événement ${actionText} avec succès !`, "success");

      //   console.log(response.idevt)

      // Optionnel : rediriger vers la liste des événements après création
      if (isCreatingNew) {
        // console.log(formDataObj)
        navigation.replace("EventMenu", {
          item: {
            evt: formData.evt,
            idevt: response.idevt,
          },
        });
      }
    } catch (error) {
      const actionText = isCreatingNew ? "création" : "modification";
      showToast(`❌ Erreur lors de la ${actionText} de l'événement`, "error");
      console.error("Erreur sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
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
      "keyboardDidHide",
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        marginTop: -sizes.sm,
        flexDirection: "column",
      }}
    >
      <View style={{ marginHorizontal: 30 }}>
        <Button gradient={gradients.primary} marginBottom={sizes.base}>
          <Text white transform="uppercase" size={18}>
            {isCreatingNew
              ? "Nouveau projet"
              : `Détails de l'Event ${eventRef}`}
          </Text>
        </Button>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            gap: 10,
            marginHorizontal: 5,
            marginVertical: 10,
          }}
        >
          <Button
            flex={1}
            gradient={gradients.secondary}
            marginBottom={sizes.base}
            rounded={true}
            round={false}
            style={{ borderColor: "#000" }}
            onPress={() => setStep("date")}
          >
            <Text white transform="uppercase" size={15}>
              Dates
            </Text>
          </Button>
          <Button
            flex={1}
            gradient={gradients.info}
            marginBottom={sizes.base}
            rounded={false}
            round={false}
            onPress={() => setStep("clients")}
          >
            <Text white transform="uppercase" size={15}>
              Clients
            </Text>
          </Button>
          <Button
            flex={1}
            gradient={gradients.success}
            marginBottom={sizes.base}
            rounded={false}
            round={false}
            onPress={() => setStep("com")}
          >
            <Text white transform="uppercase" size={15}>
              COM %
            </Text>
          </Button>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1, paddingBottom: 25 }}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        {step === "date" && (
          <Form1
            item={formData}
            eventTypes={eventTypes}
            onDataChange={handleForm5DataChange}
          />
        )}
        {step === "clients" && (
          <Form2
            item={formData2}
            onDataChange={handleForm5DataChange}
            clients={formData2?.clients}
            clientData={userdata.all_clts}
          />
        )}
        {step === "com" && (
          <Form3 item={formData3} onDataChange={handleForm5DataChange} />
        )}
      </KeyboardAwareScrollView>

      {!isKeyboardVisible && (
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginHorizontal: 20,
            }}
          >
            <Button
              flex={1}
              gradient={gradients.secondary}
              marginBottom={sizes.base}
              rounded={false}
              round={false}
              onPress={() => navigation.goBack()}
            >
              <Text white transform="uppercase" size={getFontSize(13)}>
                Retour
              </Text>
            </Button>
            <Button
              flex={1}
              gradient={gradients.warning}
              marginBottom={sizes.base}
              rounded={false}
              round={false}
              onPress={handleSaveForm}
              disabled={isSaving} // 🔧 Désactiver pendant la sauvegarde
              style={[
                isSaving && { opacity: 0.8 }, // 🔧 Légère transparence pendant le loading
                styles.saveButton,
              ]}
            >
              <View style={styles.buttonContent}>
                {isSaving && (
                  <ActivityIndicator
                    size="small"
                    color="#000"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text white transform="uppercase" size={getFontSize(13)}>
                  {isSaving
                    ? isCreatingNew
                      ? "Création..."
                      : "Sauvegarde..."
                    : isCreatingNew
                    ? "Créer"
                    : "Sauvegarder"}
                </Text>
              </View>
            </Button>
          </View>
        </Animated.View>
      )}
      <ToastComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1,
  },
  scrollViewContent: {
    padding: 15,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    height: height * 0.054,
    borderColor: "gray",
    borderWidth: 1,
    paddingLeft: 4,
    marginBottom: 16,
    borderRadius: 10,
    padding: 10,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center", // Espacement égal entre les éléments
    alignItems: "center",
    paddingHorizontal: 0, // Ajout de marges pour ne pas coller les TextInputs aux bords
    width: "100%",
    gap: 4,
  },
  footer: {
    position: "relative",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "white",
    fontSize: 18,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  saveButton: {
    minHeight: 48, // Hauteur fixe pour éviter les variations
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
export default EventDetails;
