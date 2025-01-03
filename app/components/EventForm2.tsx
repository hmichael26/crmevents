import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  FlatList
} from 'react-native';
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon';
import Button from './Button';
import { useTheme } from '../hooks';
import ClientAutocomplete from './ClientAutoComplete';

const { width, height } = Dimensions.get('window');

interface Client {
  id: number;
  nom: string;
}

interface ExistingClient {
  id_client: string;
  nom_client: string;
  prenom_client: string;
}
interface FormData {
  idevt?: Number;
  clt?: string;
  ent?: string;
  clt_email?: string;
  clt_telfix?: string;
  clt_telport?: string;
  clt_infos?: string;
  publish_as_company?: any;
  clients?: Client[];
}

type Form2Props = {
  item?: any;
  onDataChange: (data: FormData, type: string) => void;
  clients?: Client[];
  clientData?: any[];
};

const Form2: React.FC<Form2Props> = ({
  item = {},
  onDataChange,
  clients: initialClients,
  clientData = []
}) => {
  const { assets, colors, gradients, sizes } = useTheme();



  const convertExistingClientsToFormat = (clients: ExistingClient[]): Client[] => {
    return clients.map(client => ({
      id: parseInt(client.id_client),
      nom: `${client.prenom_client} ${client.nom_client}`.trim()
    }));
  };
  // State to manage form data
  const [formData, setFormData] = useState<FormData>({
    idevt: item.idevt || '',
    clt: item.clt || '',
    ent: item.ent || '',
    clt_email: item.clt_email || '',
    clt_telfix: item.clt_telfix || '',
    clt_telport: item.clt_telport || '',
    clt_infos: item.clt_infos || '',
    publish_as_company: item.publish_as_company || false,
    clients: initialClients || []
  });

  // console.log(formData.clients)
  // State for client management
  const [clients, setClients] = useState<Client[]>(() => {
    return convertExistingClientsToFormat(formData.clients || []);
  });

  // Effect to update parent component whenever form data changes
  useEffect(() => {
    onDataChange({
      ...formData,
      clients
    }, 'form2');
  }, [formData, clients]);

  // Update a specific field in form data
  const updateFormField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addClient = () => {
    const newClients = [...clients, { id: Date.now(), nom: '' }];
    setClients(newClients);
  };

  const removeClient = (id: number) => {
    const newClients = clients.filter(client => client.id !== id);
    setClients(newClients);
  };

  const updateClientSelection = (selectedClient: Client, currentClientId: number) => {
    const newClients = clients.map(client =>
      client.id === currentClientId
        ? {
          id: selectedClient.id,
          nom: selectedClient.nom
        }
        : client
    );

    setClients(newClients);
  };

  const renderClientItem = ({ item: client }: { item: Client }) => (
    <View
      key={client.id}
      style={styles.clientContainer}
    >
      <ClientAutocomplete
        clients={clientData || []}
        onSelectClient={(selectedClient) => updateClientSelection(selectedClient, client.id)}
        initialClient={client}
      />
      <TouchableOpacity onPress={() => removeClient(client.id)} style={{ paddingHorizontal: 10, paddingBottom: 5 }}>
        <Text style={{ fontSize: 23, color: colors.primary, fontWeight: "bold" }}>x</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      <TextInputWithIcon
        placeholder="Prénom NOM"
        value={formData.clt}
        onChangeText={(text) => updateFormField('clt', text)}
      />

      <View style={styles.inputContainer}>
        <TextInputWithIcon
          placeholder="Entreprise"
          style={{ width: "50%" }}
          value={formData.ent}
          onChangeText={(text) => updateFormField('ent', text)}
        />

        <TextInputWithIcon
          placeholder="Email"
          style={{ width: "50%" }}
          value={formData.clt_email}
          onChangeText={(text) => updateFormField('clt_email', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInputWithIcon
          placeholder="Téléphone fixe"
          style={{ width: "50%" }}
          value={formData.clt_telfix}
          onChangeText={(text) => updateFormField('clt_telfix', text)}
        />
        <TextInputWithIcon
          placeholder="Téléphone portable"
          style={{ width: "50%" }}
          value={formData.clt_telport}
          onChangeText={(text) => updateFormField('clt_telport', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <SwitchTextBox
          label="Publier au nom de l'entreprise"
          placeholder="Enter notification details"
          style={{ width: "100%" }}
          toogleValue={formData.publish_as_company}
          onToggle={(value) => { updateFormField('publish_as_company', value) }}
        />
      </View>

      <TextInputWithIcon
        placeholder="Infos Client"
        multiline
        numberOfLines={4}
        style={{
          height: 100,
          borderColor: '#ccc',
          borderWidth: 2
        }}
        value={formData.clt_infos}
        onChangeText={(text) => updateFormField('clt_infos', text)}
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
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 5
  },
  clientInput: {
    flex: 1,
    marginRight: 10
  }
});

export default Form2;