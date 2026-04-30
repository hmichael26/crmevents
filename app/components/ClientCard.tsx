import React, {
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useApi } from '../context/useApi'
import { useTheme } from '../hooks'
import { Button } from './'
import { AuthContext } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export const ClientCard = React.memo(
  ({
    client,
    onModify,
    onDelete,
    handleSelect,
    handleUnSelect,
    isSelected,
  }) => {
    const { t } = useTranslation()
    const { userdata } = useContext(AuthContext)
    const { colors, gradients, sizes } = useTheme()

    // États optimisés
    const [operationState, setOperationState] = useState({
      isLoading: false,
      isEditing: false,
      operation: null, // 'modify', 'delete', 'save'
    })

    const [editedClient, setEditedClient] = useState(() => ({ ...client }))

    // Refs pour le cleanup
    const timeoutRefs = useRef({})
    const abortControllerRef = useRef(null)

    // 🧹 CLEANUP MÉMOIRE
    const cleanupMemory = useCallback(() => {
      console.log('🧹 ClientCard - Nettoyage mémoire')

      // Clear timeouts
      Object.values(timeoutRefs.current).forEach(clearTimeout)
      timeoutRefs.current = {}

      // Abort requête en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      // Reset états
      setOperationState({
        isLoading: false,
        isEditing: false,
        operation: null,
      })
    }, [])

    // Helper pour gérer les opérations avec timeout
    const withOperationTimeout = useCallback(
      async (operation, operationType) => {
        const controller = new AbortController()
        abortControllerRef.current = controller

        setOperationState({
          isLoading: true,
          isEditing: operationType === 'save' ? true : operationState.isEditing,
          operation: operationType,
        })

        try {
          const timeoutId = setTimeout(() => {
            controller.abort()
          }, 30000) // 30 secondes timeout

          timeoutRefs.current[operationType] = timeoutId

          const result = await operation()

          clearTimeout(timeoutRefs.current[operationType])
          delete timeoutRefs.current[operationType]

          return result
        } catch (error) {
          if (error.name === 'AbortError') {
            Alert.alert(
              t('common.timeout'),
              t('clients.card.alerts.timeout', { type: operationType }),
            )
          } else {
            console.error(`Erreur ${operationType}:`, error)
            Alert.alert(t('common.error'), t('clients.card.alerts.error', { type: operationType }))
          }
          throw error
        } finally {
          abortControllerRef.current = null
          setOperationState((prev) => ({
            ...prev,
            isLoading: false,
            operation: null,
          }))
        }
      },
      [operationState.isEditing],
    )

    // 🔧 FONCTION DE MODIFICATION OPTIMISÉE
    const handleModify = useCallback(async () => {
      if (operationState.isEditing) {
        // Mode sauvegarde
        try {
          await withOperationTimeout(async () => {
            const data = { ...editedClient, id_client: client.id }
            await onModify(data)
          }, 'save')

          // Succès - sort du mode édition
          setOperationState((prev) => ({
            ...prev,
            isEditing: false,
          }))
        } catch (error) {
          // Erreur - reste en mode édition
          console.error('Erreur modification:', error)
        }
      } else {
        // Passe en mode édition
        setOperationState((prev) => ({
          ...prev,
          isEditing: true,
        }))
        setEditedClient({ ...client })
      }
    }, [
      operationState.isEditing,
      editedClient,
      client,
      onModify,
      withOperationTimeout,
    ])

    // 🗑️ FONCTION DE SUPPRESSION OPTIMISÉE
    const handleDelete = useCallback(async () => {
      if (!client.id) return

      Alert.alert(
        t('clients.card.alerts.deleteTitle'),
        t('clients.card.alerts.deleteConfirm', { name: client.nom }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            onPress: async () => {
              try {
                await withOperationTimeout(async () => {
                  await onDelete({ id_client: client.id })
                }, 'delete')

                // Cleanup après suppression réussie
                cleanupMemory()
              } catch (error) {
                console.error('Erreur suppression:', error)
              }
            },
            style: 'destructive',
          },
        ],
        { cancelable: false },
      )
    }, [client.id, client.nom, onDelete, withOperationTimeout, cleanupMemory])

    // 📝 GESTION DES CHANGEMENTS D'INPUT OPTIMISÉE
    const handleInputChange = useCallback((field, value) => {
      setEditedClient((prev) => ({
        ...prev,
        [field]: value,
      }))
    }, [])

    // 🎨 GESTION SÉLECTION OPTIMISÉE
    const handleToggleSelection = useCallback(() => {
      const isCurrentlySelected = isSelected(client.id)
      if (isCurrentlySelected) {
        handleUnSelect(client.id)
      } else {
        handleSelect(client.id)
      }
    }, [client.id, isSelected, handleSelect, handleUnSelect])

    // 🎭 GÉNÉRATION DU LOGO/AVATAR
    const renderLogo = useMemo(() => {
      // Construit l'URL complète du logo si disponible
      const logoUrl = client.logo
        ? `https://www.goseminaire.com/crm/upload/${client.logo}`
        : null

      // Si le client a un logo
      if (logoUrl) {
        return (
          <Image
            source={{ uri: logoUrl }}
            style={styles.clientLogo}
            onError={() => {
              console.log('Erreur chargement logo:', logoUrl)
              // En cas d'erreur, on affichera l'avatar par défaut
            }}
            resizeMode="contain"
          />
        )
      }

      // Avatar par défaut avec initiales
      const initials = client.nom
        ? client.nom
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase()
        : '??'

      // Couleur d'avatar basée sur l'ID pour être cohérente
      const avatarColors = [
        '#9932CC',
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#96CEB4',
        '#FFEAA7',
        '#DDA0DD',
        '#98D8C8',
      ]
      const avatarColor =
        avatarColors[parseInt(client.id) % avatarColors.length] || '#9932CC'

      return (
        <View
          style={[styles.avatarContainer, { backgroundColor: avatarColor }]}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      )
    }, [client.logo, client.nom, client.id])

    // 📱 COMPOSANT CHAMP ÉDITABLE OPTIMISÉ
    const renderEditableField = useCallback(
      (field, placeholder, icon = null) => {
        return (
          <View style={styles.editFieldContainer}>
            {icon && (
              <Icon
                name={icon}
                size={16}
                color="#9932CC"
                style={styles.fieldIcon}
              />
            )}
            <Text style={styles.fieldLabel}>{placeholder}</Text>
            <TextInput
              style={styles.input}
              value={editedClient[field] || ''}
              onChangeText={(text) => handleInputChange(field, text)}
              placeholder={placeholder}
              editable={!operationState.isLoading}
              autoCapitalize={field === 'email' ? 'none' : 'words'}
              keyboardType={
                field === 'email'
                  ? 'email-address'
                  : field === 'tel'
                  ? 'phone-pad'
                  : 'default'
              }
            />
          </View>
        )
      },
      [editedClient, operationState.isLoading, handleInputChange],
    )

    // 🎯 INFORMATIONS CLIENT À AFFICHER
    const clientInfo = useMemo(() => {
      const info = []

      if (client.tel) {
        info.push({ icon: 'call', text: client.tel, type: 'phone' })
      }

      if (client.infos) {
        // Si infos contient une URL (comme gpm.fr), on l'affiche comme site web
        const isWebsite =
          client.infos.includes('.') && !client.infos.includes('@')
        info.push({
          icon: isWebsite ? 'globe' : 'information-circle',
          text: client.infos,
          type: isWebsite ? 'website' : 'info',
        })
      }

      if (client.date_creation) {
        const dateCreation = new Date(client.date_creation).toLocaleDateString(
          t('common.dateLocale'),
        )
        info.push({
          icon: 'calendar',
          text: t('clients.card.createdOn', { date: dateCreation }),
          type: 'date',
        })
      }

      if (client.admin === '1') {
        info.push({
          icon: 'shield-checkmark',
          text: t('clients.card.admin'),
          type: 'admin',
        })
      }

      return info
    }, [client, t])

    // 🎯 BOUTONS D'ACTION OPTIMISÉS
    const renderActionButtons = useMemo(() => {
      const buttons = []

      // Bouton Modifier/Sauvegarder
      buttons.push(
        <Button
          key="modify"
          gradient={gradients.primary}
          style={styles.actionButton}
          flex={1}
          onPress={handleModify}
          disabled={operationState.isLoading}
        >
          {operationState.isLoading && operationState.operation === 'save' ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {operationState.isEditing ? t('clients.card.save') : t('clients.card.modify')}
            </Text>
          )}
        </Button>,
      )

      // Bouton Annuler (en mode édition)
      if (operationState.isEditing) {
        buttons.push(
          <Button
            key="cancel"
            gradient={gradients.secondary}
            style={styles.actionButton}
            flex={1}
            onPress={() => {
              setOperationState((prev) => ({ ...prev, isEditing: false }))
              setEditedClient({ ...client })
            }}
            disabled={operationState.isLoading}
          >
            <Text style={styles.buttonText}>
              {t('clients.card.cancel')}
            </Text>
          </Button>,
        )
      }

      // Bouton Supprimer (hors mode édition)
      if (!operationState.isEditing) {
        buttons.push(
          <Button
            key="delete"
            gradient={gradients.danger}
            style={styles.actionButton}
            flex={1}
            onPress={handleDelete}
            disabled={operationState.isLoading}
          >
            {operationState.isLoading &&
            operationState.operation === 'delete' ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {t('clients.card.delete')}
              </Text>
            )}
          </Button>,
        )
      }

      // 🎯 BOUTON SÉLECTIONNER - TOUJOURS VISIBLE ET PRIORITAIRE
      /*
      const isCurrentlySelected = isSelected(client.id)
      buttons.push(
        <Button
          key="select"
          gradient={isCurrentlySelected ? gradients.success : gradients.info}
          style={[
            styles.actionButton,
            isCurrentlySelected && styles.selectedButton,
          ]}
          flex={1}
          onPress={handleToggleSelection}
          disabled={operationState.isLoading}
        >
          <Text style={[styles.buttonText, styles.selectButtonText]}>
            {isCurrentlySelected ? '✓ Sélectionné' : 'Sélectionner'}
          </Text>
        </Button>,
      )
*/
      return buttons
    }, [
      gradients,
      operationState,
      handleModify,
      handleDelete,
      client.id,
      isSelected,
      handleToggleSelection,
      t,
    ])

    // 🧹 CLEANUP AU DÉMONTAGE
    useEffect(() => {
      return () => {
        console.log('🧹 ClientCard démontée - cleanup')
        cleanupMemory()
      }
    }, [cleanupMemory])

    return (
      <View style={styles.clientCard}>
        {operationState.isEditing ? (
          // MODE ÉDITION
          <View style={styles.editContainer}>
            <View style={styles.editHeader}>
              {renderLogo}
              <Text style={styles.editTitle}>{t('clients.card.editTitle')}</Text>
            </View>

            <View style={styles.editFieldsContainer}>
              {renderEditableField('nom', t('clients.card.form.name'), 'person')}
              {renderEditableField('tel', t('clients.card.form.phone'), 'call')}
              {renderEditableField('infos', t('clients.card.form.website'), 'globe')}
            </View>
          </View>
        ) : (
          // MODE AFFICHAGE - LOGO GAUCHE / TEXTE DROITE
          <View style={styles.displayContainer}>
            <View style={styles.logoSection}>{renderLogo}</View>

            <View style={styles.infoSection}>
              <Text style={styles.clientName}>
                {client.nom || t('clients.card.noName')}
              </Text>

              <View style={styles.infoList}>
                {clientInfo.map((info, index) => (
                  <View key={`${info.type}-${index}`} style={styles.infoItem}>
                    <Icon
                      name={info.icon}
                      size={14}
                      color="#666"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {info.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Badge admin si applicable */}
              {client.admin === '1' && (
                <View style={styles.adminBadge}>
                  <Icon name="shield-checkmark" size={12} color="#fff" />
                  <Text style={styles.adminText}>ADMIN</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>{renderActionButtons}</View>
      </View>
    )
  },
)

// 🎨 STYLES OPTIMISÉS
const styles = StyleSheet.create({
  clientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,

    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },

  // MODE AFFICHAGE - LOGO GAUCHE / TEXTE DROITE
  displayContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  // LOGO/AVATAR
  clientLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // INFORMATIONS CLIENT
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoList: {
    gap: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  sectorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  sectorText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  adminText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },

  // MODE ÉDITION
  editContainer: {
    gap: 16,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  editFieldsContainer: {
    gap: 12,
  },
  editFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldIcon: {
    width: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    width: 70,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 14,
  },

  // BOUTONS D'ACTION
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    minHeight: 40,
  },
  actionButton: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: '#28a745',
  },
})

export default ClientCard
