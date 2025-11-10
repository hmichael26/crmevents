import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
  Platform,
} from 'react-native'
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon'
import Button from './Button'
import { useTheme } from '../hooks'
import ClientAutocomplete from './ClientAutoComplete'
import ClientAutoDropdownComplete from './ClientAutoDropdownComplete'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const { width, height } = Dimensions.get('window')

interface Client {
  id: number
  nom: string
}

interface ExistingClient {
  id: string
  nom: string
  prenom: string
  email?: string
  tel_fixe?: string
  tel_port?: string
  infos?: string
  ent?: string
  afficher_nom_client?: any
  nom_entreprise?: string
}
interface FormData {
  idevt?: Number
  clt?: string
  ent?: string
  clt_email?: string
  clt_telfix?: string
  clt_telport?: string
  clt_infos?: string
  afficher_nom_client?: any
  clients?: Client[]
}

type Form2Props = {
  item?: any
  onDataChange: (data: FormData, type: string) => void
  clients?: Client[]
  clientData?: any[]
}

const Form2: React.FC<Form2Props> = ({
  item = {},
  onDataChange,
  clients: initialClients,
  clientData = [],
}) => {
  //  console.log(item)
  const { assets, colors, gradients, sizes } = useTheme()

  // State to manage form data
  const [formData, setFormData] = useState<FormData>({
    idevt: item.idevt || '',
    clt: item.clt || '',
    ent: item.ent || '',
    clt_email: item.clt_email || '',
    clt_telfix: item.clt_telfix || '',
    clt_telport: item.clt_telport || '',
    clt_infos: item.clt_infos || '',
    afficher_nom_client: item.afficher_nom_client || false,
    clients: initialClients || [],
  })

  // console.log(item)
  // console.log(formData.clients)
  // State for client management
  const [clients, setClients] = useState<Client[]>(() => {
    return formData.clients || []
  })

  // Effect to update parent component whenever form data changes
  useEffect(() => {
    onDataChange(
      {
        ...formData,
        clients,
      },
      'form2',
    )
  }, [formData, clients])

  // Update a specific field in form data
  const updateFormField = (field: keyof FormData, value: string | boolean) => {
    // Mise à jour standard
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Si le champ modifié est le nom du client, tenter de récupérer le client associé
    if (field === 'clt' && typeof value === 'string') {
      const normalized = (s: string) =>
        s
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .trim()
      const target = normalized(value)

      let found: ExistingClient | null = null
      if (Array.isArray(clientData)) {
        // Essai 1: correspondance exacte "prenom nom" ou "nom prenom"
        found =
          (clientData.find((c: any) => {
            const full1 = normalized(`${c.prenom || ''} ${c.nom || ''}`)
            const full2 = normalized(`${c.nom || ''} ${c.prenom || ''}`)
            return full1 === target || full2 === target
          }) as ExistingClient | undefined) || null

        // Essai 2: fallback en "includes"
        if (!found) {
          found =
            (clientData.find((c: any) => {
              const full = normalized(`${c.prenom || ''} ${c.nom || ''}`)
              return full.includes(target)
            }) as ExistingClient | undefined) || null
        }
      }

      //      console.log('🔵 Client trouvé:', found)
      if (found) {
        setFormData((prev) => ({
          ...prev,
          // Remplacer avec les valeurs du client trouvé, même si elles sont vides
          ent: found.nom_entreprise || '',
          clt_email: found.email || '',
          clt_telfix: found.tel_fixe || '',
          clt_telport: found.tel_port || '',
          clt_infos: found.infos || '',
          afficher_nom_client: found.afficher_nom_client || false,
        }))
      }
    }
  }

  const addClient = () => {
    const newClients = [...clients, { id: Date.now(), nom: '' }]
    setClients(newClients)
  }

  const removeClient = (id: number) => {
    const newClients = clients.filter((client) => client.id !== id)
    setClients(newClients)
  }

  const updateClientSelection = (
    selectedClient: Client,
    currentClientId: number,
  ) => {
    const newClients = clients.map((client) =>
      client.id === currentClientId
        ? {
            id: selectedClient.id,
            nom: selectedClient.nom,
          }
        : client,
    )

    setClients(newClients)
  }

  const renderClientItem = ({ item: client }: { item: Client }) => (
    <View key={client.id} style={styles.clientContainer}>
      <ClientAutocomplete
        clients={clientData || []}
        onSelectClient={(selectedClient) =>
          updateClientSelection(selectedClient, client.id)
        }
        initialClient={client}
      />
      <TouchableOpacity
        onPress={() => removeClient(client.id)}
        style={{ paddingHorizontal: 10, paddingBottom: 5 }}
      >
        <Text
          style={{ fontSize: 23, color: colors.primary, fontWeight: 'bold' }}
        >
          x
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <ClientAutoDropdownComplete
        placeholder="Prénom NOM"
        value={formData.clt}
        onChangeText={(text) => updateFormField('clt', text)}
        data={clientData} // Votre tableau de données
        style={{
          marginBottom: 13,
        }}
      />
      <View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Entreprise"
            style={{
              width: '50%',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ccc4',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              paddingHorizontal: 10,
              marginBottom: 13,
              height: 40,
            }}
            value={formData.ent}
            onChangeText={(text) => updateFormField('ent', text)}
            placeholderTextColor={'#000'}
            editable={false}
          />

          <TextInput
            placeholder="Email"
            style={{
              width: '50%',
              flexDirection: 'row',
              alignItems: 'center',
              height: 40,
              borderWidth: 1,
              backgroundColor: '#ccc4',
              borderColor: '#ccc',
              borderRadius: 5,
              paddingHorizontal: 10,
              marginBottom: 13,
            }}
            value={formData.clt_email}
            onChangeText={(text) => updateFormField('clt_email', text)}
            placeholderTextColor={'#000'}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Téléphone fixe"
            style={{
              width: '50%',
              flexDirection: 'row',
              alignItems: 'center',
              height: 40,
              backgroundColor: '#ccc4',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              paddingHorizontal: 10,
              marginBottom: 13,
            }}
            value={formData.clt_telfix}
            onChangeText={(text) => updateFormField('clt_telfix', text)}
            placeholderTextColor={'#000'}
            editable={false}
          />
          <TextInput
            placeholder="Téléphone portable"
            style={{
              width: '50%',
              flexDirection: 'row',
              alignItems: 'center',
              height: 40,
              backgroundColor: '#ccc4',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              paddingHorizontal: 10,
              marginBottom: 13,
            }}
            value={formData.clt_telport}
            onChangeText={(text) => updateFormField('clt_telport', text)}
            placeholderTextColor={'#000'}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <SwitchTextBox
            label="Publier au nom de l'entreprise"
            placeholder="Enter notification details"
            style={{ width: '100%' }}
            toogleValue={formData.afficher_nom_client}
            onToggle={(value) => {
              updateFormField('afficher_nom_client', value)
            }}
          />
        </View>

        <TextInput
          placeholder="Infos Client"
          multiline
          numberOfLines={4}
          style={{
            height: 100,
            borderWidth: 1,
            borderColor: '#ccc',
            backgroundColor: '#ccc4',
            borderRadius: 5,
            paddingHorizontal: 10,
            marginBottom: 13,
          }}
          value={formData.clt_infos}
          onChangeText={(text) => updateFormField('clt_infos', text)}
          placeholderTextColor={'#000'}
          editable={false}
        />

        <View
          style={{
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <Text style={{ fontSize: 16, color: colors.primary }}>
            Ajouter d'autres clients
          </Text>
          <Button
            flex={0.6}
            gradient={gradients.warning}
            marginBottom={sizes.base}
            rounded={false}
            round={false}
            style={{ marginTop: 10 }}
            onPress={addClient}
          >
            <Text style={{ fontSize: 16, color: 'white' }}> + Ajouter</Text>
          </Button>
        </View>
      </View>

      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={(client) => client.id.toString()}
        contentContainerStyle={styles.clientListContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // ⭐ SOLUTION PRINCIPALE
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
    gap: 4,
  },
  clientListContainer: {
    paddingBottom: 20,
  },
  clientContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 5,
  },
  clientInput: {
    flex: 1,
    marginRight: 10,
  },
})

export default Form2
