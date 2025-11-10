import React, { useContext, useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
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
  disabled = false, // Nouvelle prop pour désactiver la carte
}) => {
  const { userdata } = useContext(AuthContext)
  const admin = userdata?.user?.admin

  // États locaux
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProvider, setEditedProvider] = useState(provider)
  const [modal, setModal] = useState(false)
  const [modalField, setModalField] = useState('')

  // Indicateur si la carte est désactivée
  const isDisabled = useMemo(() => disabled || isLoading, [disabled, isLoading])

  // 🔧 HANDLE MODIFY CORRIGÉ
  const handleModify = useCallback(async () => {
    if (isEditing) {
      // Mode sauvegarde
      console.log('🔧 Sauvegarde des modifications prestataire:', provider.id)
      setIsLoading(true)

      try {
        const data = {
          ...editedProvider,
          id_presta: provider.id,
          id: provider.id, // Assure la compatibilité avec différents formats d'ID
        }

        console.log('📝 Données à sauvegarder:', data)

        // Appel de la fonction onModify du parent (qui gère déjà l'actualisation)
        await onModify(data)

        // Sortie du mode édition seulement si la modification a réussi
        setIsEditing(false)

        console.log('✅ Modification prestataire terminée avec succès')
      } catch (error) {
        console.error('🔴 Erreur lors de la modification prestataire:', error)

        // En cas d'erreur, on restaure les données originales
        setEditedProvider(provider)

        Alert.alert(
          'Erreur',
          'Impossible de modifier le prestataire. Les modifications ont été annulées.',
        )
      } finally {
        setIsLoading(false)
      }
    } else {
      // Mode édition
      console.log('✏️ Passage en mode édition pour prestataire:', provider.id)
      setIsEditing(true)
      setEditedProvider(provider) // Réinitialise avec les données actuelles
    }
  }, [isEditing, editedProvider, provider, onModify])

  // 🗑️ HANDLE DELETE CORRIGÉ
  const handleDelete = useCallback(async () => {
    if (!provider.id) {
      Alert.alert('Erreur', 'ID du prestataire manquant')
      return
    }

    console.log('🗑️ Demande de suppression prestataire:', provider.id)

    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer "${provider.nom}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)

            try {
              const deleteData = {
                id_presta: provider.id,
                id: provider.id, // Compatibilité avec différents formats
              }

              console.log('🗑️ Suppression en cours:', deleteData)

              // Appel de la fonction onDelete du parent (qui gère déjà l'actualisation)
              await onDelete(deleteData)

              console.log('✅ Suppression prestataire terminée avec succès')
            } catch (error) {
              console.error(
                '🔴 Erreur lors de la suppression prestataire:',
                error,
              )
              Alert.alert('Erreur', 'Impossible de supprimer le prestataire')
            } finally {
              setIsLoading(false)
            }
          },
        },
      ],
      { cancelable: false },
    )
  }, [provider.id, provider.nom, onDelete])

  // 🎯 HANDLE SELECTION
  const handleSelectionToggle = useCallback(() => {
    const isCurrentlySelected = isSelected(provider.id)

    console.log(
      `🎯 ${isCurrentlySelected ? 'Désélection' : 'Sélection'} prestataire:`,
      provider.id,
    )

    if (isCurrentlySelected) {
      handleUnSelect(provider.id)
    } else {
      handleSelect(provider.id)
    }
  }, [provider.id, isSelected, handleSelect, handleUnSelect])

  // 📝 HANDLE INPUT CHANGE OPTIMISÉ
  const handleInputChange = useCallback((field, value) => {
    console.log('📝 Modification champ:', field, value)

    setEditedProvider((prev) => {
      const newProvider = { ...prev }

      // Gestion spéciale pour les champs avec sélection
      if (field === 'fk_departement') {
        newProvider.dept = value.name || value.libelle
        newProvider[field] = value.id
      } else if (field === 'fk_ville') {
        newProvider.ville = value.name || value.libelle
        newProvider[field] = value.id
      } else if (field === 'fk_region') {
        newProvider.region = value.name || value.libelle
        newProvider[field] = value.id
      } else {
        // Champs texte simples
        newProvider[field] = typeof value === 'object' ? value.id : value
      }

      return newProvider
    })
  }, [])

  // 🔍 OPEN MODAL
  const openModal = useCallback((field) => {
    console.log('🔍 Ouverture modal pour champ:', field)
    setModalField(field)
    setModal(true)
  }, [])

  // 📱 RENDER EDITABLE FIELD
  const renderEditableField = useCallback(
    (field, placeholder) => {
      const isSelectField = [
        'fk_departement',
        'fk_ville',
        'fk_region',
      ].includes(field)

      if (isSelectField) {
        const displayValue =
          field === 'fk_departement'
            ? editedProvider.dept
            : field === 'fk_ville'
            ? editedProvider.ville
            : field === 'fk_region'
            ? editedProvider.region
            : ''

        return (
          <View style={styles.editFieldContainer}>
            <Text style={styles.fieldLabel}>{placeholder}</Text>
            <TextInput
              style={[styles.input, styles.selectInput]}
              placeholder={placeholder}
              value={displayValue || ''}
              editable={false}
            />
            <TouchableOpacity
              style={[styles.selectButton, isDisabled && styles.disabledButton]}
              onPress={() => openModal(field)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  isDisabled && styles.disabledText,
                ]}
              >
                Sélectionner
              </Text>
            </TouchableOpacity>
          </View>
        )
      }

      return (
        <View style={styles.editFieldContainer}>
          <Text style={styles.fieldLabel}>{placeholder}</Text>
          <TextInput
            style={[styles.input, styles.textInput]}
            value={editedProvider[field] || ''}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholder={placeholder}
            editable={!isDisabled}
          />
        </View>
      )
    },
    [editedProvider, openModal, handleInputChange, isDisabled],
  )

  return (
    <View style={[styles.providerCard, isDisabled && styles.disabledCard]}>
      {/* Mode édition */}
      {isEditing ? (
        <View style={styles.editContainer}>
          {renderEditableField('nom', 'Nom')}
          {renderEditableField('tel', 'Téléphone')}
          {renderEditableField('email1', 'Email')}
          {renderEditableField('nb_salle', 'Nombre de salles')}
          {renderEditableField('nb_chbre', 'Nombre de chambres')}
          {renderEditableField('fk_departement', 'Département')}
          {renderEditableField('fk_ville', 'Ville')}
          {renderEditableField('fk_region', 'Région')}
        </View>
      ) : (
        /* Mode affichage */
        <View style={styles.displayContainer}>
          <Text style={styles.providerName}>{provider.nom}</Text>

          <View style={styles.tagContainer}>
            {provider.tel && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>📞 {provider.tel}</Text>
              </View>
            )}
            {provider.email1 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>📧 {provider.email1}</Text>
              </View>
            )}
          </View>

          <View style={styles.tagContainer}>
            {provider.nb_salle && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  🏢 {provider.nb_salle} salles
                </Text>
              </View>
            )}
            {provider.nb_chbre && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>🛏️ {provider.nb_chbre} ch.</Text>
              </View>
            )}
          </View>

          <View style={styles.tagContainer}>
            {provider.dept && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>📍 {provider.dept}</Text>
              </View>
            )}
            {provider.ville && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>🏙️ {provider.ville}</Text>
              </View>
            )}
            {provider.region && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>🗺️ {provider.region}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        {/* Bouton Modifier/Enregistrer */}
        <Button
          gradient={useTheme().gradients.primary}
          style={styles.actionButton}
          flex={1}
          onPress={handleModify}
          disabled={isDisabled}
        >
          {isLoading && isEditing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>
              {isEditing ? 'Enregistrer' : 'Modifier'}
            </Text>
          )}
        </Button>

        {/* Bouton Annuler (en mode édition) */}
        {isEditing && (
          <Button
            flex={1}
            gradient={useTheme().gradients.secondary}
            style={styles.actionButton}
            onPress={() => {
              console.log('🚫 Annulation des modifications')
              setIsEditing(false)
              setEditedProvider(provider) // Restaure les données originales
            }}
            disabled={isDisabled}
          >
            <Text style={styles.actionButtonText}>Annuler</Text>
          </Button>
        )}

        {/* Bouton Supprimer (hors mode édition) */}
        {!isEditing && (
          <Button
            gradient={useTheme().gradients.danger}
            style={styles.actionButton}
            flex={1}
            onPress={handleDelete}
            disabled={isDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Supprimer</Text>
            )}
          </Button>
        )}

        {/* Bouton Sélectionner (admin seulement) */}
        {admin == 1 && (
          <Button
            gradient={
              isSelected(provider.id)
                ? useTheme().gradients.secondary
                : useTheme().gradients.info
            }
            flex={1}
            style={styles.actionButton}
            onPress={handleSelectionToggle}
            disabled={isDisabled}
          >
            <Text style={styles.actionButtonText}>
              {isSelected(provider.id) ? 'Désélectionner' : 'Sélectionner'}
            </Text>
          </Button>
        )}
      </View>

      {/* Modal de sélection */}
      <SelectionModal
        visible={modal && !isDisabled}
        field={modalField}
        onSelectItem={(item) => {
          handleInputChange(modalField, item)
          setModal(false)
        }}
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
  disabledCard: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  displayContainer: {
    gap: 12,
  },
  editContainer: {
    gap: 8,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#B8B8D1',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    minWidth: 100,
    justifyContent: 'center',
  },
  tagText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  editFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 80,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textInput: {
    flex: 1,
  },
  selectInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  selectButton: {
    backgroundColor: '#9932CC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
})

export default React.memo(ProviderCard)
