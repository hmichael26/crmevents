import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, PixelRatio, SafeAreaView, Text as TextBlock, Modal, Image, Linking } from 'react-native';
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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Picker } from '@react-native-picker/picker';
import ModalForm from './ModalForm';
import { AuthContext } from '../context/AuthContext';

import PdfModal from './PdfModal';
import { useApi } from '../context/useApi';
import DevisInterface from './DevisInterface';





// import { Container } from './styles';
const options = [
  { id: '1', label: 'oui' },
  { id: '2', label: 'non' },
  { id: '3', label: 'supprimer' },
  // Add more options as needed
];

const { width, height } = Dimensions.get('window');
const fontScale = PixelRatio.getFontScale();
const getFontSize = (size: number) => size / fontScale;

const Form4 = ({ item, onDataChange }) => {


  // console.log(item.id_deroule)


  const { validdevis, validbrochure, sendDemande } = useApi();




  const [prestataireModifications, setPrestataireModifications] = useState({});

  const [formFields, setFormFields] = useState({
    comment: activeBadgeData?.comment || '',
    email: activeBadgeData?.email || '',
    tel: activeBadgeData?.tel || ''
  });


  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);

  const [modalFormDevis, setModalFormDevis] = useState(false);
  const [modalimage, setModalimage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState('');
  const [selectedOption2, setSelectedOption2] = useState('');
  const { assets, colors, gradients, sizes } = useTheme();
  const [switch1, setSwitch1] = useState(true); //  true pour le switch comparateur
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(false);
  const [validForm1, setValid1] = useState<Boolean>(false);
  const [validForm2, setValid2] = useState<Boolean>(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);

  const [currentForm, setCurrentForm] = useState<number | null>(null); // 1 pour Form1, 2 pour Form2
  ;
  const [activeBadge, setActiveBadge] = useState<number | null>(0);
  const [activeBadgeData, setActiveBadgeData] = useState<any>(null);
  const [badges, setBadges] = useState([]);


  const handleOptionSelect = async (option: React.SetStateAction<string>, type: number) => {
    if (type == 1) {
      if (option === 'supprimer') {
        validateForm(1); // Ouvre le modal pour confirmer la suppression
      } else {


        setSelectedOption(option); // Met à jour directement l'option sélectionnée
      }
    } else {
      if (option === 'supprimer') {
        validateForm(2); // Ouvre le modal pour confirmer la suppression
      } else {
        await validbrochure({
          id_presta: activeBadgeData.id_presta,
          valid: option
        });
        setSelectedOption2(option); // Met à jour directement l'option sélectionnée
      }
    }
  };

  const openModalImage = () => setModalimage(true);
  const closeModalimage = () => setModalimage(false);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % activeBadgeData?.all_imgs?.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + activeBadgeData?.all_imgs?.length) % activeBadgeData?.all_imgs?.length);
  };


  const handleConfirm = async () => {
    // Si le formulaire 1 est actif et confirmé
    if (currentForm === 1) {
      setSelectedOption('supprimer'); // Applique la suppression
      console.log('Formulaire 1 supprimé');
    } else if (currentForm === 2) {
      await validbrochure({
        id_presta: activeBadgeData?.id_presta,
        valid: 'supprimer'
      });
      setSelectedOption2('supprimer'); // Applique la suppression
      console.log('Formulaire 2 supprimé');
    }

    setModalVisible(false); // Ferme le modal après la confirmation
    setCurrentForm(null); // Réinitialise le formulaire actif
  };

  const handleCancel = () => {
    setModalVisible(false); // Ferme le modal sans rien faire
    setCurrentForm(null); // Réinitialise le formulaire actif
    console.log('Suppression annulée');
  };

  const validateForm = (formNumber: number) => {
    setCurrentForm(formNumber); // Active le formulaire correspondant
    setModalVisible(true); // Ouvre le modal de confirmation
  };



  useEffect(() => {
    if (item) {
      const badges = item?.all_presta_interroges?.map((item) => ({
        text: item.nom_presta,
        number: 0,
        color: item.color
      }));
      setBadges(badges);
    }
  }, [item]);

  // Mettre à jour les champs quand on change de prestataire actif
  useEffect(() => {
    if (activeBadgeData) {
      // Charger soit les modifications sauvegardées, soit les données originales
      const savedModifications = prestataireModifications[activeBadgeData.nom_presta];
      setFormFields({
        comment: savedModifications?.comment || activeBadgeData.comment || '',
        email: savedModifications?.email || activeBadgeData.email || '',
        tel: savedModifications?.contact || activeBadgeData.contact || ''
      });
    }
  }, [activeBadgeData]);


  useEffect(() => {
    if (prestataireModifications) {
      onDataChange(prestataireModifications);
    }
  }, [prestataireModifications]);

  const handleFieldChange = (field, value) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveCurrentChanges = () => {
    if (activeBadgeData) {
      const hasChanges = Object.values(formFields).some(value => value !== '');

      if (hasChanges) {
        setPrestataireModifications(prev => ({
          ...prev,
          [activeBadgeData.nom_presta]: {
            ...formFields,
          }
        }));
      }
    }
  };

  // Obtenir toutes les modifications pour l'envoi
  const getAllModifications = () => {
    // Sauvegarder les modifications actuelles avant de retourner
    saveCurrentChanges();
    return Object.values(prestataireModifications);
  };

  // Fonction pour soumettre toutes les modifications
  const handleSubmitAll = () => {
    const allModifications = getAllModifications();
    console.log("Modifications à envoyer:", allModifications);
    // Ici vous pouvez ajouter la logique pour envoyer les données
  };


  const handleOpenPdf = async (pdfUri) => {
    try {
      let uriToOpen = pdfUri;

      // Si le PDF est une URL distante, téléchargez-le d'abord
      if (pdfUri.startsWith('http://') || pdfUri.startsWith('https://')) {
        const localUri = `${FileSystem.documentDirectory}temp.pdf`;
        const { uri } = await FileSystem.downloadAsync(pdfUri, localUri);
        uriToOpen = uri; // Mettre à jour l'URI pour pointer vers le fichier local téléchargé
      }

      // Vérifier si le partage est disponible sur l'appareil
      if (await Sharing.isAvailableAsync()) {
        // Ouvrir le fichier PDF en utilisant le gestionnaire de partage
        await Sharing.shareAsync(uriToOpen);
      } else {
        console.log('Le partage n\'est pas disponible sur cet appareil');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du PDF :', error);
    }
  };

  const openDocument = async () => {
    if (activeBadgeData?.lien_brochure) {
      /*
      setPdfUri(activeBadgeData.lien_brochure);
      setPdfModalVisible(true);*/

      Linking.openURL(activeBadgeData?.lien_brochure);
    }
  };



  const openDevis = async (link) => {
    if (link) {
      Linking.openURL(link);
    }


  };

  console.log(activeBadgeData);

  const [badgeToDelete, setBadgeToDelete] = useState<number | null>(null);

  const handleBadgeClick = (badgeIndex, value) => {
    // Sauvegarder les modifications du prestataire actuel avant de changer
    if (activeBadgeData) {
      saveCurrentChanges();
    }

    setActiveBadge(prevActiveBadge =>
      prevActiveBadge === badgeIndex ? 0 : badgeIndex
    );

    const selectedPresta = item.all_presta_interroges.find(
      presta => presta.nom_presta === value.text
    );
    setActiveBadgeData(selectedPresta);
  };
  const handleBadgeDelete = (index: number) => {
    setBadgeToDelete(index);
    setModalVisible2(true);
  };

  const confirmDeleteBadge = () => {
    if (badgeToDelete !== null) {
      setBadges(prevBadges =>
        prevBadges.filter((_, index) => index !== badgeToDelete)
      );

      // Reset active badge if needed
      if (badges.length === 1) {
        setActiveBadge(0);
      } else if (activeBadge === badgeToDelete + 1) {
        setActiveBadge(0);
      }

      setModalVisible2(false);
      setBadgeToDelete(null);
    }
  };

  // console.log(item?.id_deroule)
  const onModify = () => {

    fetchData(currentPage, true);
  };

  {
    if (item?.id_deroule && item?.all_presta_interroges?.length === 0)
      return (
        <View >
          <TextBlock style={{ color: colors.danger, fontSize: 20, textAlign: 'center' }}>Aucun prestataire associé à ce deroule</TextBlock>
        </View>)
  }



  {
    if (badges.length === 0)
      return (
        <View >
          <TextBlock style={{ color: colors.danger, fontSize: 20, textAlign: 'center' }}>chargement ...</TextBlock>
        </View>)
  }




  return <SafeAreaView >
    {false && <PdfModal
      visible={pdfModalVisible}
      onClose={() => setPdfModalVisible(false)}
      pdfUri={pdfUri}
    />

    }

    <View style={styles.container}>







      {badges.length > 0 && badges.map((badge, index) => (
        (activeBadge === 0 || activeBadge === index + 1) &&
        <Badge
          key={index}
          text={badge.text}
          badgeNumber={badge.number}
          badgeColor={badge.color}
          onPress={() => handleBadgeClick(index + 1, badge)}
          onDelete={() => handleBadgeDelete(index)}
          isActive={activeBadge === index + 1}
        />
      ))}
      <ConfirmationModal
        visible={modalVisible2}
        onClose={() => setModalVisible2(false)}
        onConfirm={confirmDeleteBadge}
        onCancel={() => setModalVisible2(false)}
        message="Voulez-vous vraiment supprimer ce badge ?"
      />
      {
        activeBadge !== 0 && <>
          <View style={{ borderWidth: 1, borderColor: "#000", borderRadius: 10 }} >

            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 5, marginVertical: 3 }}>
              <Button flex={1} gradient={gradients.success} rounded={false} round={false} onPress={async () => sendDemande({
                id_presta: activeBadgeData?.id_presta,
                id_deroule: item?.id_deroule
              })}>
                <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                  envoyer
                </Text>
                <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                  Demander
                </Text>
              </Button>
              <View style={{ flex: 1, flexDirection: "column", borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 3 }}>
                <Text black size={getFontSize(12)} bold style={{ marginRight: 3, textTransform: "uppercase", textAlign: "center" }}  >
                  DEMANDE ENVOYée LE
                </Text>
                <Text color={colors.primary} size={width * 0.027} bold style={{ maxWidth: '100%', textAlign: "center" }} >
                  {new Date(activeBadgeData?.date_demande_envoye).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 5, marginVertical: 3 }}>


              <Button flex={1} gradient={gradients.secondary} rounded={false} round={false} onPress={() => setModalFormDevis(true)}>
                <Text white bold transform="uppercase" size={getFontSize(13)}>
                  Inserer
                </Text>
                <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                  devis
                </Text>
              </Button>
              <View style={{ flex: 1, flexDirection: "column", borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 3 }}>
                <Text black size={getFontSize(12)} bold style={{ marginRight: 3, textTransform: "uppercase", textAlign: "center" }}  >
                  DEVIS REcu LE
                </Text>
                <Text color={colors.primary} size={width * 0.027} bold style={{ maxWidth: '100%', textAlign: "center" }} >
                  {new Date(activeBadgeData?.date_devis_recu).toLocaleDateString()}
                </Text>
              </View>

            </View>


            <View style={{ flex: 1 }}>

              <DevisInterface
                activeBadgeData={activeBadgeData}
                gradients={gradients}
                sizes={sizes}
                getFontSize={getFontSize}
                openDevis={openDevis}
              />


              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 5, marginVertical: 0 }} >

                <Button flex={1} gradient={gradients.info} marginBottom={sizes.base / 2} rounded={false} round={false} onPress={() => openDocument(activeBadgeData)}>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    ouvrir
                  </Text>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    brochure
                  </Text>
                </Button>
                {false && <Button flex={0.6} gradient={gradients.warning} marginBottom={sizes.base / 2} rounded={false} round={false}>
                  <Text white bold transform="uppercase" size={getFontSize(12)}>
                    Telecharger
                  </Text>
                  <Text white size={getFontSize(12)} bold style={{ textTransform: 'uppercase' }}>
                    brochure
                  </Text>
                </Button>}

                <View style={{ flex: 1, flexDirection: "row", width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 1, borderRadius: 10, marginBottom: 5, height: getFontSize(48) }}>
                  {selectedOption2 ? <Text black bold size={getFontSize(12)} style={{ width: '75%', marginLeft: 6, textAlign: "center" }} >{selectedOption2}</Text> : <Text black bold size={getFontSize(12)} style={{ width: '75%', marginLeft: 6, textAlign: "center" }}>valider</Text>}



                  <Picker
                    style={{ width: "10%", marginLeft: 5 }}
                    selectedValue={selectedOption2}
                    onValueChange={(itemValue) => handleOptionSelect(itemValue, 2)}
                  // mode='dropdown'
                  >

                    {options.map((option, index) => (
                      <Picker.Item key={index} label={option.label} value={option.label} />
                    ))}
                  </Picker>

                </View>
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 5, marginVertical: 0 }}>

                <Button flex={1} gradient={gradients.info} rounded={false} round={false} onPress={openModalImage}>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    Galerie
                  </Text>
                  <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                    photo
                  </Text>
                </Button>
                <View style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: "center",
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,

                  paddingVertical: 5,
                  marginBottom: 2,
                  width: "46%"

                }}>
                  <Text color={colors.primary} bold style={{ fontSize: 20 }}>{activeBadgeData?.budget} eur</Text>

                </View>

              </View>
              <Modal
                animationType="fade"
                transparent={true}
                visible={modalimage}
                onRequestClose={closeModalimage}
              >

                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />

                <View style={styles.modalContainer}>
                  {activeBadgeData?.all_imgs && activeBadgeData?.all_imgs.length > 0 &&
                    <Image
                      source={{ uri: activeBadgeData?.all_imgs[currentImageIndex].image }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  }
                  {
                    !activeBadgeData?.all_imgs || activeBadgeData?.all_imgs.length === 0 &&
                    <View style={styles.modalContainer}>
                      <Text white size={getFontSize(16)} bold> image indisponible</Text>
                    </View>
                  }
                  <View style={styles.navigationContainer}>
                    <TouchableOpacity onPress={prevImage} style={styles.navButton}>
                      <Text white size={getFontSize(16)} bold>Précédent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={nextImage} style={styles.navButton}>
                      <Text white size={getFontSize(16)} bold>Suivant</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={closeModalimage} style={styles.closeButton}>
                    <Text white size={getFontSize(16)} bold>Fermer</Text>
                  </TouchableOpacity>
                </View>

              </Modal>

              <ConfirmationModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                message="vous ete sur le point de supprimer ?"
              />
            </View>

            <View style={{ flex: 1, flexDirection: 'row', alignItems: "center", justifyContent: "center", marginTop: 6, marginHorizontal: 5, gap: 10 }}>

              <View style={{
                flex: 1,
                flexDirection: 'row',

                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,

                padding: 3,

                marginBottom: 2,



              }}>

                <Font6 name='thumbs-down' color={colors.danger} size={getFontSize(23)}></Font6>

              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', marginTop: 6, gap: 10 }}>

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
                flex: 1,
              }}>
                <Text color={colors.dark} bold style={{ fontSize: 20 }}>Commission: </Text>
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
                flex: 0.75,

              }}>
                <Text black bold size={getFontSize(12)}>Option : </Text>
                <Text color={colors.primary} bold size={getFontSize(12)}>Multi-Option</Text>

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
                value={formFields.comment}
                onChangeText={(text) => handleFieldChange('comment', text)}
                placeholder='Autre proposition de commission && Commentaires prestataire'
              />
            </View>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", margin: 3 }}>
              <View style={{ width: "50%" }}>

                <TextInputWithIcon
                  value={formFields.email}
                  onChangeText={(text) => handleFieldChange('email', text)}
                  placeholder="email prestataire"
                />
              </View>

              <View style={{ width: "50%" }}>

                <TextInputWithIcon
                  value={formFields.contact}
                  onChangeText={(text) => handleFieldChange('contact', text)}
                  placeholder="Prenom & Telephone"
                />
              </View>
            </View>
          </View>

          {badges.map((badge, index) => (

            (index != activeBadge - 1) && ( // condition pour afficher uniquement le badge suivant
              <Badge
                key={index}
                text={badge.text}
                badgeNumber={badge.number}
                badgeColor={badge.color} // Si le composant Badge accepte badgeColor
                onPress={() => handleBadgeClick(index + 1, badge)} // Vous pouvez enlever le +1 si handleBadgeClick gère l'index correctement
              />
            )
          ))}



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

    {badges.map((badge, index) => (
      (activeBadge === 0 || activeBadge === index + 1) &&
      <ModalForm
        visible={activeBadge !== 0 && modalFormDevis}
        onClose={() => setModalFormDevis(false)}
        //   onSubmit={handleSubmit}
        badge={badge.text}
      />
    ))}




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
  }, modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 50,
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
})
export default Form4;