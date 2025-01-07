import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  FlatList
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';


interface Client {
  id: number;
  nom: string;

}

interface ClientAutocompleteProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (client: Client) => void;
  initialClient?: Client; // Nouvelle prop optionnelle

}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  clients,
  onSelectClient,
  onEditClient,
  onDeleteClient,
  initialClient
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    initialClient || null
  );



  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );


  //onsole.log(initialClient)

  const renderClientItem = ({ item }: { item: Client }) => (
    <View style={styles.clientItemContainer}>
      <TouchableOpacity
        style={styles.clientItemDetails}
        onPress={() => {
          onSelectClient(item);
          setSelectedClient(item);  // Stocker l'objet client complet
          setModalVisible(false);
        }}
      >

        <Icon name="user-o" color="#666" size={24} />

        <View style={styles.clientTextContainer}>
          <Text style={styles.clientName}>{item.nom}</Text>

        </View>
      </TouchableOpacity>

      <View style={styles.clientActions}>
        {onEditClient && (
          <TouchableOpacity
            onPress={() => {
              onEditClient(item);
              setModalVisible(false);
            }}
            style={styles.actionButton}
          >
            <Icon name="pencil" color="#4A90E2" size={20} />

          </TouchableOpacity>
        )}

        {onDeleteClient && (
          <TouchableOpacity
            onPress={() => {
              onDeleteClient(item);
              setModalVisible(false);
            }}
            style={styles.actionButton}
          >

            <Icon name="trash" color="#FF6347" size={20} />

          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setModalVisible(true)}
      >



        <Text style={styles.clientName}>
          {(selectedClient && selectedClient.nom != "") ? selectedClient.nom : 'Sélectionner un client'}
        </Text>


      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <Icon name="search" color="#666" size={20} />

              <TextInput
                placeholder="Rechercher un client"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderClientItem}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Aucun client trouvé
                  </Text>
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    backgroundColor: 'white',
  },
  inputText: {
    marginLeft: 10,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  clientItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientTextContainer: {
    marginLeft: 15,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clientSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  clientActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  closeButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  closeButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ClientAutocomplete;