import React, { useContext, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native'
import { useApi } from '../context/useApi'
import { useTheme } from '../hooks'
import Button from './Button'
import SelectionModal from './SelectionModal'
import { Colors } from '../constants/Colors'
import { AuthContext } from '../context/AuthContext'

export const ProviderCard = ({
  provider,
  onModify,
  onDelete,
  handleSelect,
  handleUnSelect,
  isSelected,
}) => {
  const { userdata } = useContext(AuthContext)
  const admin = userdata?.user?.admin

  const { deletepresta } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProvider, setEditedProvider] = useState(provider)
  const [modal, setModal] = useState(false)
  const [modalField, setModalField] = useState('')

  const handleModify = async () => {
    if (isEditing) {
      setIsLoading(true) // Démarrer le chargement
      try {
        const data = { ...editedProvider, id_presta: provider.id }
        await onModify(data) // Assurez-vous que `onModify` est une fonction asynchrone
      } catch (error) {
        console.error('Erreur lors de la modification :', error)
      } finally {
        setIsLoading(false) // Terminer le chargement
      }
    }
    setIsEditing(!isEditing)
    console.log(editedProvider)
  }

  const handleDelete = async () => {
    if (!provider.id) return

    Alert.alert(
      'Supprimer prestataire',
      'Êtes-vous sûr de vouloir supprimer ce prestataire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            setIsLoading(true) // Démarrer le chargement
            try {
              await onDelete({ id_presta: provider.id }) // Assurez-vous que `onDelete` est une fonction asynchrone
            } catch (error) {
              console.error('Erreur lors de la suppression :', error)
            } finally {
              setIsLoading(false) // Terminer le chargement
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false },
    )
  }

  const handleInputChange = (field, value) => {
    // console.log(field, value)

    if (field === 'fk_departement') {
      setEditedProvider((prev) => ({ ...prev, dept: value.name }))
      // editedProvider.dept = value.libelle;
    }
    if (field === 'fk_ville') {
      setEditedProvider((prev) => ({ ...prev, ville: value.name }))
    }
    if (field === 'fk_region') {
      setEditedProvider((prev) => ({ ...prev, region: value.name }))
    }

    setEditedProvider((prev) => ({ ...prev, [field]: value.id }))
  }

  const openModal = (field) => {
    setModalField(field)
    setModal(true)
  }

  const renderEditableField = (field, placeholder) => {
    if (
      field === 'fk_departement' ||
      field === 'fk_ville' ||
      field === 'fk_region'
    ) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            gap: 10,
            alignContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#666',
              marginRight: 10,
            }}
          >
            {placeholder}
          </Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={placeholder}
            value={
              field === 'fk_departement'
                ? editedProvider.dept
                : field === 'fk_ville'
                ? editedProvider.ville
                : field === 'fk_region'
                ? editedProvider.region
                : ''
            }
            editable={false} // Make the TextInput non-editable
          />
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: '#ccc', marginBottom: 7 },
            ]}
            onPress={() => openModal(field)}
          >
            <Text style={styles.buttonText}>Select</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          alignContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#666',
            marginRight: 10,
          }}
        >
          {placeholder}
        </Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={editedProvider[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={placeholder}
        />
      </View>
    )
  }

  return (
    <View style={styles.providerCard}>
      {isEditing ? (
        <>
          {renderEditableField('nom', 'Nom')}
          {renderEditableField('tel', 'Téléphone')}
          {renderEditableField('email1', 'Email')}
          {renderEditableField('nb_salle', 'Nombre de salles')}
          {renderEditableField('nb_chbre', 'Nombre de chambres')}
          {renderEditableField('fk_departement', 'Département')}
          {renderEditableField('fk_ville', 'Ville')}
          {renderEditableField('fk_region', 'Région')}
        </>
      ) : (
        <>
          <Text style={styles.providerName}>{provider.nom}</Text>

          <View style={styles.tagContainer}>
            {provider.tel && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{provider.tel}</Text>
              </View>
            )}
            {provider.email1 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{provider.email1}</Text>
              </View>
            )}
          </View>

          <View style={styles.tagContainer}>
            {provider.nb_salle && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{provider.nb_salle} salles</Text>
              </View>
            )}
            {provider.nb_chbre && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{provider.nb_chbre} ch.</Text>
              </View>
            )}
          </View>

          <View style={styles.tagContainer}>
            {provider.fk_departement && provider.dept && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{provider.dept}</Text>
              </View>
            )}
            {provider.fk_ville && provider.ville && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{provider.ville}</Text>
              </View>
            )}
            {provider.fk_region && provider.region && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{provider.region}</Text>
              </View>
            )}
          </View>
        </>
      )}

      <View style={styles.actionButtons}>
        <Button
          gradient={useTheme().gradients.primary}
          style={[{ backgroundColor: useTheme().colors.primary }]}
          flex={1}
          onPress={handleModify}
          disabled={isLoading} // Désactiver le bouton pendant le chargement
        >
          <Text style={[styles.modifyButtonText, { padding: 0 }]}>
            {isLoading && isEditing
              ? 'En cours...'
              : isEditing
              ? 'Enregistrer'
              : 'Modifier'}
          </Text>
        </Button>
        {isEditing && (
          <Button
            flex={1}
            gradient={useTheme().gradients.secondary}
            style={[{ backgroundColor: useTheme().colors.primary }]}
            onPress={() => {
              setIsEditing(false)
            }}
            disabled={isLoading} // Désactiver le bouton pendant le chargement
          >
            <Text style={styles.modifyButtonText}>Annuler</Text>
          </Button>
        )}

        {!isEditing && (
          <Button
            gradient={useTheme().gradients.danger}
            //style={[styles.deleteButton]}
            flex={1}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </Text>
          </Button>
        )}

        {admin == 1 && (
          <>
            <Button
              gradient={
                isSelected(provider.id)
                  ? useTheme().gradients.secondary
                  : useTheme().gradients.info
              }
              flex={1}
              onPress={() => {
                isSelected(provider.id)
                  ? handleUnSelect(provider.id)
                  : handleSelect(provider.id)
              }}
              disabled={isLoading}
            >
              <Text style={styles.modifyButtonText}>
                {isSelected(provider.id) ? 'Désélectionner' : 'Sélectionner'}
              </Text>
            </Button>
          </>
        )}
      </View>

      <SelectionModal
        visible={modal}
        field={modalField}
        onSelectItem={(item) => (
          handleInputChange(modalField, item), setModal(false)
        )}
        onClose={() => setModal(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  providerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginVertical: 8,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#B8B8D1',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    //  justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,

    justifyContent: 'center',
  },
  tagText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    height: 40,
  },
  modifyButton: {
    borderRadius: 20,
    paddingVertical: 0,
    paddingHorizontal: 20,
  },
  modifyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deleteButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
