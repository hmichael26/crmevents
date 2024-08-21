import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon';
import MultiSelect from './MultiSelectBox';

// import { Container } from './styles';
const options = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
    // Add more options as needed
  ];
  const { width, height } = Dimensions.get('window');

const Form1= () => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const handleSelectionChange = (selectedIds: string[]) => {
        setSelectedOptions(selectedIds);
      };
    
  return  <View style={styles.container}>
  <TextInputWithIcon


    placeholder="Titre de l'Event"

  />

  <View style={styles.inputContainer}>
    <TextInputWithIcon

      iconName="calendar"
      placeholder="Date de creation"
      style={{ width: "50%" }}

    />
    <TextInputWithIcon


      placeholder="REF Projet : 931"
      style={{ width: "50%" }}

    />
  </View>
  <View style={styles.inputContainer}>
    <TextInputWithIcon

      iconName="mail"
      placeholder="Pax"
      style={{ width: "30%" }}

    />

    <TextInputWithIcon


      placeholder="Zone geographique"
      style={{ width: "70%" }}

    />
  </View>
  <View>
    <MultiSelect
      options={options}
      selectedOptions={selectedOptions}
      onSelectionChange={handleSelectionChange}
    />
  </View>

  <View style={styles.inputContainer}>
    <TextInputWithIcon

      iconName="calendar"
      placeholder="Date d'arrive"
      style={{ width: "50%" }}

    /> 
    <TextInputWithIcon

      iconName="calendar"
      placeholder="Date de depart"
      style={{ width: "50%" }}

    />
  </View>
  <View style={styles.inputContainer}>
  <SwitchTextBox 
    label="date Flexible"
    placeholder="Enter notification details"
    style={{ width: "50%" }}
    onToggle={(value) => console.log('Switch toggled:', value)}
  />
     <TextInputWithIcon

fonsiName="dollar"
placeholder="Budget"
style={{ width: "50%" }}

/>
  </View>


    <TextInputWithIcon

    
      placeholder="Commentaire pour le prestataire"
      multiline
      numberOfLines={4}
      style={{
        height: 100,
        borderColor: '#ccc',
        borderWidth: 2
      }}

    />

    <TextInputWithIcon

     
      placeholder="Commentaire Personnel"
      multiline
      numberOfLines={4}
      style={{
        height: 100,
        borderColor: '#ccc',
        borderWidth: 2
      }}

    />


  


</View>;
}


const styles = StyleSheet.create({
    container: {
      padding: 5,
      marginHorizontal: 15,
      flex: 1
  
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
    },  button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 4,
      marginVertical: 8,
    },
    buttonText: {
      color: '#333333',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign:"center"
    },
  })
export default Form1;