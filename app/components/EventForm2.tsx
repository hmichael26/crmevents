import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon';
import MultiSelect from './MultiSelectBox';
import Button from './Button';
import { useTheme } from '../hooks';

// import { Container } from './styles';
const options = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
  // Add more options as needed
];
const { width, height } = Dimensions.get('window');

type Form2Props = {
  item: any;
};

const Form2: React.FC<Form2Props> = ({ item }) => {

  const [clients, setClients] = useState<string[]>([""]);

  const addClient = () => {
    setClients([...clients, '']);
  };

  const removeClient = (index: number) => {
    const newClients = clients.filter((_, i) => i !== index);
    setClients(newClients);
  };

  const updateClient = (index: number, value: string) => {
    const newClients = [...clients];
    newClients[index] = value;
    setClients(newClients);
  };
  const { assets, colors, gradients, sizes } = useTheme();

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedOptions(selectedIds);
  };

  return <View style={styles.container}>
    <TextInputWithIcon


      placeholder="Prénom NOM"
      value={item.clt}

    />

    <View style={styles.inputContainer}>
      <TextInputWithIcon


        placeholder="Entreprise"
        style={{ width: "50%" }}
        value={item.ent}
      />
      <TextInputWithIcon


        placeholder="Email"
        style={{ width: "50%" }}
        value={item.clt_email}
      />
    </View>
    <View style={styles.inputContainer}>
      <TextInputWithIcon


        placeholder="Téléphone fixe"
        style={{ width: "50%" }}
        value={item.clt_telfix}
      />

      <TextInputWithIcon


        placeholder="Téléphone portable"
        style={{ width: "50%" }}
        value={item.clt_telport}
      />
    </View>



    <View style={styles.inputContainer}>
      <SwitchTextBox
        label="Publier au nom de l'entreprise"
        placeholder="Enter notification details"
        style={{ width: "100%" }}
        onToggle={(value) => console.log('Switch toggled:', value)}
      />

    </View>


    <TextInputWithIcon


      placeholder="Infos CLient"
      multiline
      numberOfLines={4}
      style={{
        height: 100,
        borderColor: '#ccc',
        borderWidth: 2
      }}
      value={item.clt_infos}
    />


    <View style={{ flexDirection: "row", gap: 2, alignItems: "center", justifyContent: "space-around" }}>
      <Text style={{ fontSize: 16, color: colors.primary }}>Ajouter d'autres clients</Text>
      <Button flex={0.6} gradient={gradients.warning} marginBottom={sizes.base} rounded={false} round={false} style={{ marginTop: 10 }} onPress={addClient}>
        <Text style={{ fontSize: 16, color: "white" }}> + Ajouter</Text>
      </Button>
    </View>


 

   
    {clients.map((client, index) => (
     
      <View key={index} style={{ flexDirection: "row", alignContent: "center", justifyContent: "space-between", borderColor: "#ccc", borderWidth: 1, padding: 10, borderRadius: 10 , marginVertical: 5}}>
        <TextInput
          style={{ fontSize: 18, color: "#ccc" }}
          value={client}
          onChangeText={(text) => updateClient(index, text)}
          placeholder="Nom du client"
        />
        <TouchableOpacity onPress={() => removeClient(index)}>
          <Text style={{ fontSize: 20, color: colors.primary, fontWeight: "bold" }}>x</Text>
        </TouchableOpacity>
      </View>
    ))}
 



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
    borderColor: '#000',
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
  }, clientInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  clientInput: {
    flex: 1,
    fontSize: 18,
    color: "#333",
  },
  removeClientButton: {
    fontSize: 24,

    fontWeight: "bold",
    marginLeft: 10,
  },
})
export default Form2;