import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon';
import MultiSelect from './MultiSelectBox';
import Button from './Button';
import { useTheme } from '../hooks';

const options = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
];

const { width, height } = Dimensions.get('window');

interface Client {
  id: number;
  clt: string;
}

type Form2Props = {
  item: any;
  onDataChange: (clients: Client[]) => void;
  clients?: Client[];
};

const Form2: React.FC<Form2Props> = ({ item, onDataChange, clients: initialClients }) => {
  const { assets, colors, gradients, sizes } = useTheme();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>(initialClients || [{ id: 1, clt: '' }]);

  useEffect(() => {
    if (initialClients) {
      setClients(initialClients);
    }
  }, [initialClients]);

  const addClient = () => {
    const newId = clients.length > 0 
      ? Math.max(...clients.map(c => c.id)) + 1 
      : 1;
    
    const newClients = [...clients, { id: newId, clt: '' }];
    setClients(newClients);
    onDataChange(newClients);
  };

  const removeClient = (id: number) => {
    const newClients = clients.filter(client => client.id !== id);
    setClients(newClients);
    onDataChange(newClients);
  };

  const updateClient = (id: number, value: string) => {
    const newClients = clients.map(client =>
      client.id === id ? { ...client, clt: value } : client
    );
    setClients(newClients);
    onDataChange(newClients);
  };

  return (
    <View style={styles.container}>
      <TextInputWithIcon
        placeholder="Prénom NOM"
        value={item?.clt}
      />

      <View style={styles.inputContainer}>
        <TextInputWithIcon
          placeholder="Entreprise"
          style={{ width: "50%" }}
          value={item?.ent}
        />
        <TextInputWithIcon
          placeholder="Email"
          style={{ width: "50%" }}
          value={item?.clt_email}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInputWithIcon
          placeholder="Téléphone fixe"
          style={{ width: "50%" }}
          value={item?.clt_telfix}
        />
        <TextInputWithIcon
          placeholder="Téléphone portable"
          style={{ width: "50%" }}
          value={item?.clt_telport}
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
        value={item?.clt_infos}
      />

      <View style={{ flexDirection: "row", gap: 2, alignItems: "center", justifyContent: "space-around" }}>
        <Text style={{ fontSize: 16, color: colors.primary }}>Ajouter d'autres clients</Text>
        <Button 
          flex={0.6} 
          gradient={gradients.warning} 
          marginBottom={sizes.base} 
          rounded={false} 
          round={false} 
          style={{ marginTop: 10 }} 
          onPress={addClient}
        >
          <Text style={{ fontSize: 16, color: "white" }}> + Ajouter</Text>
        </Button>
      </View>

      {clients && clients.map((client) => (
        <View 
          key={client.id} 
          style={styles.clientContainer}
        >
          <TextInput
            style={styles.clientInput}
            value={client.clt}
            onChangeText={(text) => updateClient(client.id, text)}
            placeholder="Nom du client"
          />
          <TouchableOpacity onPress={() => removeClient(client.id)}>
            <Text style={{ fontSize: 20, color: colors.primary, fontWeight: "bold" }}>x</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: "100%",
    gap: 4
  },
  clientContainer: {
    flexDirection: "row", 
    alignContent: "center", 
    justifyContent: "space-between", 
    borderColor: "#ccc", 
    borderWidth: 1, 
    padding: 10, 
    borderRadius: 10, 
    marginVertical: 5
  },
  clientInput: {
    fontSize: 18, 
    color: "#000"
  },
  removeButton: {
    fontSize: 20, 
    color: "#007AFF", 
    fontWeight: "bold"
  }
});

export default Form2;