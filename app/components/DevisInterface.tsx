import React, { useState, useEffect, useMemo } from 'react'
import { Alert, View, StyleSheet, Dimensions, PixelRatio } from 'react-native'
import Button from './Button'
import { Picker } from '@react-native-picker/picker'
import Text from './Text'
import { useApi } from '../context/useApi'
import { useTranslation } from 'react-i18next'
import ConfirmationModal from './ConfirmModal'
import Dropdown from './Dropdown'

// ===========================
// CONSTANTES RESPONSIVES
// ===========================
const { width, height } = Dimensions.get('window')
const fontScale = PixelRatio.getFontScale()

// Fonctions responsives cohérentes avec Form4
const getFontSizeResponsive = (size) => {
  const scale = width / 375 // Base sur iPhone X
  const newSize = size * scale
  return Math.max(newSize / fontScale, size * 0.8) // Taille minimum
}

const getResponsiveWidth = (percentage) => width * (percentage / 150)
const getResponsiveHeight = (percentage) => height * (percentage / 150)

// Breakpoints responsifs
const isSmallScreen = width < 350
const isMediumScreen = width >= 350 && width < 400
const isLargeScreen = width >= 400

const DevisInterface = ({
  activeBadgeData,
  gradients,
  sizes,
  getFontSize,
  openDevis,
}) => {
  const { t } = useTranslation()
  console.log('📋 DevisInterface - données reçues:', activeBadgeData)

  // ===========================
  // ÉTATS LOCAUX
  // ===========================
  const [devisSelections, setDevisSelections] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalVisible2, setModalVisible2] = useState(false)
  const [selectedDevisId, setSelectedDevisId] = useState(null)

  // Nouvel état pour gérer les devis supprimés localement
  const [locallyDeletedDevis, setLocallyDeletedDevis] = useState(new Set())
  const [localDevisData, setLocalDevisData] = useState([])

  // ===========================
  // HOOKS & API
  // ===========================
  const { validdevis } = useApi()

  const getOptions = (t) => [
    { id: '1', label: t('labels.yes') },
    { id: '2', label: t('labels.no') },
    { id: '3', label: t('labels.delete') },
  ]

  // ===========================
  // DONNÉES FILTRÉES
  // ===========================

  // Filtrer les devis visibles (exclure les supprimés localement et ceux avec valid = 3)
  const visibleDevis = useMemo(() => {
    if (!activeBadgeData?.all_devis) return []

    return activeBadgeData.all_devis.filter((devis) => {
      const isNotDeleted =
        devis.valid != 3 && !locallyDeletedDevis.has(devis.id_devis)
      console.log(
        `📋 Devis ${devis.id_devis}: valid=${
          devis.valid
        }, locallyDeleted=${locallyDeletedDevis.has(
          devis.id_devis,
        )}, visible=${isNotDeleted}`,
      )
      return isNotDeleted
    })
  }, [activeBadgeData?.all_devis, locallyDeletedDevis])

  // ===========================
  // EFFETS
  // ===========================

  // Initialiser les sélections des devis
  useEffect(() => {
    if (!activeBadgeData?.all_devis) return

    const initialSelections = {}
    activeBadgeData.all_devis.forEach((devis) => {
      // Ne pas inclure les devis déjà supprimés (valid = 3)
      if (devis.valid != 3) {
        initialSelections[devis.id_devis] =
          devis.valid === '1' ? t('labels.yes') : devis.valid === '2' ? t('labels.no') : ''
      }
    })

    console.log('🔧 Sélections initiales des devis:', initialSelections)
    setDevisSelections(initialSelections)
  }, [activeBadgeData])

  // Réinitialiser les suppressions locales quand les données changent
  useEffect(() => {
    if (activeBadgeData?.all_devis) {
      // Nettoyer les suppressions locales qui ne correspondent plus aux données actuelles
      setLocallyDeletedDevis((prevDeleted) => {
        const currentDevisIds = new Set(
          activeBadgeData.all_devis.map((d) => d.id_devis),
        )
        const stillValidDeleted = new Set()

        prevDeleted.forEach((id) => {
          if (currentDevisIds.has(id)) {
            stillValidDeleted.add(id)
          }
        })

        if (stillValidDeleted.size !== prevDeleted.size) {
          console.log('🔧 Nettoyage des suppressions locales:', {
            avant: Array.from(prevDeleted),
            après: Array.from(stillValidDeleted),
          })
        }

        return stillValidDeleted
      })
    }
  }, [activeBadgeData?.all_devis])

  // ===========================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ===========================

  const updateDevisStatus = async (devisId, uiStatus, apiStatus) => {
    setIsSubmitting(true)

    try {
      console.log(
        `🔄 Mise à jour du devis ${devisId} vers le statut: ${uiStatus} (API: ${apiStatus})`,
      )

      // Si c'est une suppression, cacher immédiatement le devis localement
      if (apiStatus === 'supprimer') {
        console.log(`🗑️ Suppression locale immédiate du devis ${devisId}`)
        setLocallyDeletedDevis((prev) => new Set(prev).add(devisId))

        // Supprimer de la sélection locale aussi
        setDevisSelections((prev) => {
          const newSelections = { ...prev }
          delete newSelections[devisId]
          return newSelections
        })
      } else {
        // Pour les autres statuts, mettre à jour immédiatement l'interface
        setDevisSelections((prev) => ({ ...prev, [devisId]: uiStatus }))
      }

      // Appel API en arrière-plan
      console.log(`📡 Envoi API avec statut: ${apiStatus}`)

      const response = await validdevis({ id_devis: devisId, valid: apiStatus })
      console.log('✅ Réponse API:', response)

      // Message de confirmation approprié
      const successMessage =
        apiStatus === 'supprimer'
          ? t('presta.quotes.successDeleted')
          : t('presta.quotes.successUpdated')

      Alert.alert(t('presta.quotes.confirmation'), successMessage)
    } catch (error) {
      console.error('🔴 Erreur lors de la mise à jour du devis:', error)

      // En cas d'erreur, annuler les modifications locales
      if (apiStatus === 'supprimer') {
        console.log(
          `↩️ Annulation de la suppression locale du devis ${devisId}`,
        )
        setLocallyDeletedDevis((prev) => {
          const newDeleted = new Set(prev)
          newDeleted.delete(devisId)
          return newDeleted
        })

        // Restaurer dans la sélection
        const originalDevis = activeBadgeData?.all_devis?.find(
          (d) => d.id_devis === devisId,
        )
        if (originalDevis) {
          const originalStatus =
            originalDevis.valid === '1'
              ? t('labels.yes')
              : originalDevis.valid === '2'
              ? t('labels.no')
              : ''
          setDevisSelections((prev) => ({ ...prev, [devisId]: originalStatus }))
        }
      } else {
        // Pour les autres statuts, restaurer la valeur précédente
        const originalDevis = activeBadgeData?.all_devis?.find(
          (d) => d.id_devis === devisId,
        )
        if (originalDevis) {
          const originalStatus =
            originalDevis.valid === '1'
              ? t('labels.yes')
              : originalDevis.valid === '2'
              ? t('labels.no')
              : ''
          setDevisSelections((prev) => ({ ...prev, [devisId]: originalStatus }))
        }
      }

      Alert.alert(
        t('presta.quotes.error'),
        t('presta.quotes.errorUpdate'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOptionSelect = (devisId, selectedItem) => {
    console.log(`👆 Sélection pour devis ${devisId}: ${selectedItem.label} (ID: ${selectedItem.id})`)
    
    const actionId = selectedItem.id // '1', '2', '3'
    const uiStatus = selectedItem.label
    const apiStatus = actionId === '1' ? 'oui' : actionId === '2' ? 'non' : 'supprimer'

    if (actionId === '3') {
      setSelectedDevisId(devisId)
      setModalVisible2(true)
    } else {
      updateDevisStatus(devisId, uiStatus, apiStatus)
    }
  }

  const confirmDeletion = () => {
    console.log(`✅ Confirmation de suppression du devis ${selectedDevisId}`)
    if (selectedDevisId) {
      updateDevisStatus(selectedDevisId, t('labels.delete'), 'supprimer')
      setModalVisible2(false)
      setSelectedDevisId(null)
    }
  }

  const handleCancelDeletion = () => {
    console.log('❌ Annulation de la suppression')
    setModalVisible2(false)
    setSelectedDevisId(null)
  }

  // ===========================
  // RENDU CONDITIONNEL
  // ===========================

  if (!activeBadgeData?.all_devis || activeBadgeData.all_devis.length === 0) {
    console.log('⚠️ Aucun devis disponible')
    return null
  }

  if (visibleDevis.length === 0) {
    console.log('⚠️ Tous les devis sont cachés/supprimés')
    return (
      <View style={styles.emptyContainer}>
        <Text size={getFontSize(14)} style={styles.emptyText}>
          {t('presta.quotes.none')}
        </Text>
      </View>
    )
  }

  console.log(
    `📋 Rendu de ${visibleDevis.length} devis visibles sur ${activeBadgeData.all_devis.length} total`,
  )

  // ===========================
  // RENDU PRINCIPAL
  // ===========================
  return (
    <>
      {visibleDevis.map((item, index) => (
        <View key={`devis-${item.id_devis}-${index}`} style={styles.actionRow}>
          <Button
            flex={1}
            gradient={gradients.info}
            rounded={false}
            round={false}
            onPress={() => openDevis(item.lien_devis)}
            disabled={isSubmitting}
          >
            <Text
              white
              size={getFontSize(isSmallScreen ? 11 : 13)}
              style={styles.buttonText}
            >
              {t('presta.providers.actions.open')}
            </Text>
            <Text
              white
              size={getFontSize(isSmallScreen ? 10 : 12)}
              style={styles.buttonText}
            >
              {t('presta.quotes.label')} {index + 1}
            </Text>
          </Button>

          <Button flex={1} style={styles.infoBox}>
            <Dropdown
              data={getOptions(t)}
              onChange={(value) =>
                handleOptionSelect(item.id_devis, value)
              }
              placeholder={t('presta.providers.actions.validate')}
              defaultValue={{
                [item.id_devis]: devisSelections[item.id_devis],
              }}
              disabled={isSubmitting}
            />
          </Button>
        </View>
      ))}

      {/* Modal de confirmation pour la suppression */}
      <ConfirmationModal
        visible={modalVisible2}
        onClose={handleCancelDeletion}
        onConfirm={confirmDeletion}
        onCancel={handleCancelDeletion}
        message={t('presta.providers.modals.confirmDeleteQuote')}
      />
    </>
  )
}

// ===========================
// STYLES RESPONSIFS
// ===========================
const styles = StyleSheet.create({
  devisRow: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveWidth(2),
    marginHorizontal: getResponsiveWidth(1),
    marginVertical: getResponsiveHeight(0.3),
  },
  buttonText: {
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  dropdownContainer: {
    flex: 1,
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: getResponsiveWidth(2),
    borderRadius: 10,
    marginBottom: getResponsiveHeight(0.5),
    height: getFontSizeResponsive(isSmallScreen ? 40 : 48),
    marginTop: isSmallScreen ? getResponsiveHeight(1) : 0,
  },
  infoBox: {
    width: isSmallScreen ? '100%' : 'auto',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  actionRow: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveWidth(2),
    marginHorizontal: getResponsiveWidth(1),
    marginVertical: getResponsiveHeight(0.5),
  },
  emptyContainer: {
    padding: getResponsiveHeight(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})

export default DevisInterface
