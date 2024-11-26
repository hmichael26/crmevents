import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  FlatList
} from 'react-native';
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon';
import Button from './Button';
import { useTheme } from '../hooks';
import CustomAutocomplete from './CustomAutocomplete';
import { Pencil, Trash2, User, Search } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Client {
  id: number;
  clt: string;
}

type Form2Props = {
  item: any;
  onDataChange: (clients: Client[]) => void;
  clients?: Client[];
  clientData?: any;
};

const Form2: React.FC<Form2Props> = ({
  item,
  onDataChange,
  clients: initialClients,
  clientData
}) => {
  const { assets, colors, gradients, sizes } = useTheme();
  const [clients, setClients] = useState<Client[]>(() => {
    if (initialClients && initialClients.length > 0) {
      return initialClients;
    }
    return [];
  });

  const names = clientData.map((clt: { nom: any; }) => clt.nom).filter((name: string) => name.trim() !== '');

  useEffect(() => {
    if (initialClients) {
      setClients(initialClients);
    }
  }, [initialClients]);

  const addClient = () => {
    const newClients = [
      ...clients,
      { id: Date.now(), clt: '' }
    ];
    setClients(newClients);
    onDataChange(newClients);
  };

  const removeClient = (id: number) => {
    const newClients = clients.filter(client => client.id !== id);

    if (newClients.length === 0) {
      newClients.push({ id: Date.now(), clt: '' });
    }

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

  const addClientAutocomplete = (name: string, id: number) => {
    const fullClientData = clientData?.find((clt: any) => clt.nom === name);

    const newClients = clients.map(client =>
      client.id === id
        ? {
          ...client,
          clt: name,
        }
        : client
    );

    setClients(newClients);
    onDataChange(newClients);
  };

  const renderClientItem = ({ item: client }: { item: Client }) => (
    <View
      key={client.id}
      style={styles.clientContainer}
    >
      <CustomAutocomplete
        data={names}
        onSelect={(selectedName) => addClientAutocomplete(selectedName, client.id)}
        placeholder="Nom du client"
        style={styles.clientInput}
      />
      <TouchableOpacity onPress={() => removeClient(client.id)}>
        <Text style={{ fontSize: 20, color: colors.primary, fontWeight: "bold" }}>x</Text>
      </TouchableOpacity>
    </View>
  );



  return (
    <KeyboardAvoidingView style={styles.container}>
      <TextInputWithIcon
        placeholder="Prénom NOM"
        value={item?.clt}
      />

      {true && (
        <>
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
        </>
      )}

      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={(client) => client.id.toString()}
        contentContainerStyle={styles.clientListContainer}
      />
    </KeyboardAvoidingView>
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
  clientListContainer: {
    paddingBottom: 20
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
    flex: 1,
    marginRight: 10
  }
});

export default Form2;