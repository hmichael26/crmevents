import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, PixelRatio, SafeAreaView } from 'react-native';
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon';
import MultiSelect from './MultiSelectBox';
import { useTheme } from '../hooks';
import Switch from './Switch';
import Button from './Button';
import Badge from './Badge';
import Text from './Text';
import Icon from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Font6 from 'react-native-vector-icons/FontAwesome6';
import Input from './Input';
import ConfirmationModal from './ConfirmModal';

// import { Container } from './styles';
const options = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
  // Add more options as needed
];


const { width, height } = Dimensions.get('window');
const fontScale = PixelRatio.getFontScale();
const getFontSize = (size: number) => size / fontScale;

const Form4 = () => {
  const { assets, colors, gradients, sizes } = useTheme();
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(false);
  const [validForm1, setValid1] = useState<Boolean>(false);
  const [validForm2, setValid2] = useState<Boolean>(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [currentForm, setCurrentForm] = useState<number | null>(null); // 1 pour Form1, 2 pour Form2

  const handleConfirm = () => {
    setModalVisible(false);
    if (currentForm === 1) {
      setValid1(true);
      console.log('Formulaire 1 validé');
    } else if (currentForm === 2) {
      setValid2(true);
      console.log('Formulaire 2 validé');
    }
    setCurrentForm(null);
  };

  const handleCancel = () => {
    setModalVisible(false);
    if (currentForm === 1) {
      setValid1(false); // Dévalide Formulaire 1
      console.log('Formulaire 1 dévalidé');
    } else if (currentForm === 2) {
      setValid2(false); // Dévalide Formulaire 2
      console.log('Formulaire 2 dévalidé');
    }
    setCurrentForm(null);
  };

  const validateForm = (formNumber: number) => {
    if (formNumber === 1) {
      setCurrentForm(1);
      setModalVisible(true);
    } else if (formNumber === 2) {
      setCurrentForm(2);
      setModalVisible(true);
    }
  };

  const [activeBadge, setActiveBadge] = useState<number | null>(0);
  const [badges, setBadges] = useState([
    { text: 'Hotel NORMANDY', number: 0, color: 'success' },
    { text: 'CHATEAU MONTVILLARGENNE', number: 0, color: 'black' },
    { text: 'PULMANN TOUR EIFFEL', number: 0, color: 'secondary' },
    { text: 'PULMANN TOUR EIFFEL', number: 0, color: 'secondary' },
    { text: 'LE COLLECTIONNEUR', number: 0, color: 'secondary' },
    { text: 'BARRIERE ENGHIEN', number: 0, color: 'secondary' },
    { text: 'LE BRACH', number: 0, color: 'black' },
    { text: 'CHATEAU DE LA TOUR', number: 0, color: 'success' },
    { text: '1k HOTEL', number: 0, color: 'success' },
  ]);

  const handleBadgeClick = (badgeIndex: number) => {
    // Toggle activeBadge
    setActiveBadge(prevActiveBadge =>
      prevActiveBadge === badgeIndex ? 0 : badgeIndex
    );

    /*
    // Update badge number
    setBadges(prevBadges => {
      const updatedBadges = [...prevBadges];
      updatedBadges[badgeIndex - 1].number += 1; // No need to subtract 1 from index
      return updatedBadges;
    });*/
  };

  return <SafeAreaView >
    <View style={styles.container}>

    {badges.map((badge, index) => (
       (activeBadge === 0 || activeBadge === index+1) &&
        <Badge 
          key={index}
          text={badge.text} 
          badgeNumber={badge.number} 
          badgeColor={badge.color} // Assuming your Badge component accepts a badgeColor prop
          onPress={() => handleBadgeClick(index+1)} 
        

        />
      ))}
      {
        activeBadge !== 0 && <>
          <View style={{ borderWidth: 1, borderColor: "#000", borderRadius: 10 }} >
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 5, marginVertical: 3 }}>

              <Button flex={1} gradient={gradients.success} marginBottom={sizes.base / 2} rounded={false} round={false} >
                <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                  envoyer
                </Text>
                <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                  Demander
                </Text>
              </Button>
              <Button flex={1} gradient={gradients.secondary} marginBottom={sizes.base / 2} rounded={false} round={false}>
                <Text white bold transform="uppercase" size={getFontSize(13)}>
                  Inserer
                </Text>
                <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                  devis
                </Text>
              </Button>
              <Button flex={0.2} gradient={gradients.danger} marginBottom={sizes.base / 2} rounded={false} round={false}>
                <Icon name='trash' size={getFontSize(30)} style={{ color: "#fff" }}></Icon>
              </Button>

            </View>
            <View style={{ flex: 1, flexDirection: "row", marginHorizontal: 2, gap: 3 }}>
              <View style={{ flex: 0.7, flexDirection: "row", borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 4 }}>
                <Text black size={getFontSize(13)} bold style={{ marginRight: 3 }} >
                  inserer le
                </Text>
                <Text color={colors.primary} size={width * 0.027} bold style={{ maxWidth: '100%' }} >
                  12/01/2024
                </Text>
              </View>
              <View style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 4 }}>
                <Text black size={getFontSize(13)} bold style={{ marginRight: 2 }}>
                  inserer le
                </Text>
                <Text color={colors.primary} size={width * 0.027} bold style={{ maxWidth: '100%' }}>
                  13/01/2024 à 14h00
                </Text>
              </View>

            </View>
            <View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 5, marginTop: 15 }}>

                <Button flex={1} gradient={gradients.info} marginBottom={sizes.base / 2} rounded={false} round={false} >
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    ouvrir
                  </Text>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    un devis
                  </Text>
                </Button>
                <Button flex={1} gradient={gradients.warning} marginBottom={sizes.base / 2} rounded={false} round={false}>
                  <Text white bold transform="uppercase" size={getFontSize(13)}>
                    Telecharger
                  </Text>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    devis
                  </Text>
                </Button>
                <Button flex={0.4} marginBottom={sizes.base} rounded={false} round={false} style={{ borderWidth: 1, borderColor: "#ccc" }} onPress={() => validateForm(1)}>

                  <Text black size={getFontSize(13)} bold style={{ textTransform: 'uppercase', }}>
                    Valider
                  </Text>
                  {
                    validForm1 && <Text black size={getFontSize(13)} bold style={{ textTransform: 'uppercase', }}>
                      V
                    </Text>
                  }
                </Button>

              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 5, marginVertical: 0 }} >

                <Button flex={1} gradient={gradients.info} marginBottom={sizes.base / 2} rounded={false} round={false}  >
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    ouvrir
                  </Text>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    brochure
                  </Text>
                </Button>
                <Button flex={1} gradient={gradients.warning} marginBottom={sizes.base / 2} rounded={false} round={false}>
                  <Text white bold transform="uppercase" size={getFontSize(13)}>
                    Telecharger
                  </Text>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    brochure
                  </Text>
                </Button>
                <Button flex={0.4} marginBottom={sizes.base} rounded={false} round={false} style={{ borderWidth: 1, borderColor: "#ccc" }} onPress={() => validateForm(2)}>

                  <Text black size={getFontSize(13)} bold style={{ textTransform: 'uppercase', }}>
                    Valider
                  </Text>
                  {
                    validForm2 && <Text black size={getFontSize(13)} bold style={{ textTransform: 'uppercase', }}>
                      V
                    </Text>
                  }
                </Button>

              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 10, marginHorizontal: 5, marginVertical: 0 }}>

                <Button flex={0.26} gradient={gradients.info} marginBottom={sizes.base / 2} rounded={false} round={false} >
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    Galerie
                  </Text>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    photo
                  </Text>
                </Button>


              </View>

              <ConfirmationModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                message="vous ete sur le point de valider ?"
              />
            </View>
            <View style={{ flex: 1, flexDirection: 'row', marginTop: 6 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: "center",
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,

                paddingVertical: 5,
                marginHorizontal: 4,
                marginBottom: 2,
                width: "50%",
                gap: 5

              }}>
                <Text black bold style={{ fontSize: 15 }}>Comparateur</Text>
                <Switch
                  checked={switch1}
                  switchStyle={{ }}
                 
                  onPress={(checked) => setSwitch1(checked)}
                />
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: "center",
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginBottom: 2,
                width: "46%"

              }}>
                <Text color={colors.primary} bold style={{ fontSize: 20 }}>12000$</Text>

              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', marginTop: 6 }}>
              <View style={{
                flexDirection: 'row',

                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,

                paddingVertical: 5,
                marginHorizontal: 4,
                marginBottom: 2,
                flex: 0.4,
                gap: 5

              }}>

                <Font6 name='thumbs-down' color={colors.danger} size={getFontSize(23)}></Font6>

              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: "center",
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginBottom: 2,
                flex: 0.4,
              }}>
                <Text color={colors.primary} bold style={{ fontSize: 20 }}>0.5%</Text>

              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginBottom: 2,
                marginHorizontal: 4,
                flex: 1,

              }}>
                <Text black bold size={getFontSize(16)}>Option : </Text>
                <Text color={colors.primary} bold style={{ fontSize: 20 }}>Multi-Option</Text>

              </View>
            </View>

            <View>
              <Input
                multiline
                numberOfLines={2}
                style={{
                  height: 70,
                  marginHorizontal: 4
                }}
                placeholder='Autreproposition de commission && Commentaires prestataire'
              >

              </Input>
            </View>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", margin: 3 }}>
              <TextInputWithIcon


                placeholder="email prestataire"


                style={{ width: "50%" }}


              />


              <TextInputWithIcon


                placeholder="Prenom & Telephone"
                style={{ width: "50%" }}

              />
            </View>
          </View>


          <Button flex={1} gradient={gradients.black} marginBottom={0} rounded={false} round={false} marginTop={sizes.base / 2}>
            <Text white size={getFontSize(17)} bold style={{ textTransform: 'uppercase' }} h5>
              CHâteau montvillargenne
            </Text>

          </Button>

        </>
      }


    </View>
    {
       activeBadge !== 0 &&
      <View style={{ flex: 1, flexDirection: "row", alignContent: "center", justifyContent: "center", marginHorizontal: 100 }}>
        <Button flex={1} width={"40%"} gradient={gradients.success} marginBottom={0} rounded={false} round={false} marginTop={sizes.base / 2}>
          <Text white size={getFontSize(15)} bold style={{ textTransform: 'uppercase' }} h5 center>
            Envoyer demande à tous les lieux
          </Text>

        </Button>
      </View>
    }


  </SafeAreaView>
    ;
}


const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,


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

    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,

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
export default Form4;