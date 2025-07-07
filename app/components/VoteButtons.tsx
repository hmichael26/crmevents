import React, { useState, useCallback, useMemo } from 'react'
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { ThumbsDown, ThumbsUp } from 'react-native-feather'
import { useApi } from '../context/useApi'

interface VoteButtonsProps {
  item: {
    id_presta: number
    nom_presta: string
    pouce_leve?: number
    pouce_baisse?: number
  }
  eventData: {
    id_evt: string | number
    id_client: string | number
  }
  derouleId: number
  onVoteSuccess?: () => void
  onVoteError?: (error: string) => void
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  item,
  eventData,
  derouleId,
  onVoteSuccess,
  onVoteError,
}) => {
  const { sendPouce } = useApi()

  // États locaux pour un feedback immédiat
  const [localVoteState, setLocalVoteState] = useState<{
    pouce_leve: number
    pouce_baisse: number
  }>({
    pouce_leve: item.pouce_leve || 0,
    pouce_baisse: item.pouce_baisse || 0,
  })

  const [isVoting, setIsVoting] = useState(false)
  const [votingType, setVotingType] = useState<'up' | 'down' | null>(null)

  // Memoized vote states
  const voteStates = useMemo(
    () => ({
      hasUpVote: localVoteState.pouce_leve == 1,
      hasDownVote: localVoteState.pouce_baisse == 1,
    }),
    [localVoteState],
  )

  // Optimized vote handler avec feedback immédiat
  const handleVote = useCallback(
    async (type: 'up' | 'down') => {
      if (isVoting) return

      const isUpVote = type === 'up'
      const currentUpVote = localVoteState.pouce_leve
      const currentDownVote = localVoteState.pouce_baisse

      // Calcul du nouveau vote
      let newUpVote = 0
      let newDownVote = 0

      if (isUpVote) {
        // Si on clique sur pouce levé
        newUpVote = currentUpVote === 1 ? 0 : 1 // Toggle
        newDownVote = 0 // Reset pouce baissé
      } else {
        // Si on clique sur pouce baissé
        newDownVote = currentDownVote === 1 ? 0 : 1 // Toggle
        newUpVote = 0 // Reset pouce levé
      }

      console.log('🔵 Vote:', {
        type,
        presta: item.nom_presta,
        current: { up: currentUpVote, down: currentDownVote },
        new: { up: newUpVote, down: newDownVote },
      })

      // Feedback immédiat dans l'UI
      setLocalVoteState({
        pouce_leve: newUpVote,
        pouce_baisse: newDownVote,
      })

      setIsVoting(true)
      setVotingType(type)

      try {
        const response = await sendPouce({
          ...eventData,
          id_deroule: derouleId,
          id_presta: item.id_presta,
          pouce_leve: newUpVote,
          pouce_baisse: newDownVote,
        })

        if (response.code === 'SUCCESS' || response.status === 200) {
          console.log('🟢 Vote envoyé avec succès')
          onVoteSuccess?.()
        } else {
          throw new Error(response.message || 'Erreur lors du vote')
        }
      } catch (error) {
        console.error('🔴 Erreur vote:', error)

        // Rollback en cas d'erreur
        setLocalVoteState({
          pouce_leve: item.pouce_leve || 0,
          pouce_baisse: item.pouce_baisse || 0,
        })

        const errorMessage =
          error?.response?.status === 403
            ? "Vous n'avez pas les permissions pour voter"
            : error?.response?.status === 404
            ? 'Ressource non trouvée'
            : error?.request
            ? 'Problème de connexion'
            : 'Erreur lors du vote'

        onVoteError?.(errorMessage)
      } finally {
        setIsVoting(false)
        setVotingType(null)
      }
    },
    [
      isVoting,
      localVoteState,
      eventData,
      derouleId,
      item.id_presta,
      item.nom_presta,
      item.pouce_leve,
      item.pouce_baisse,
      sendPouce,
      onVoteSuccess,
      onVoteError,
    ],
  )

  // Handlers pour chaque type de vote
  const handleUpVote = useCallback(() => handleVote('up'), [handleVote])
  const handleDownVote = useCallback(() => handleVote('down'), [handleVote])

  return (
    <View style={styles.container}>
      {/* Bouton Pouce Levé */}
      <TouchableOpacity
        style={[
          styles.voteButton,
          voteStates.hasUpVote && styles.voteButtonActive,
          isVoting && styles.voteButtonDisabled,
        ]}
        onPress={handleUpVote}
        disabled={isVoting}
        activeOpacity={0.7}
      >
        {isVoting && votingType === 'up' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThumbsUp
            stroke="#fff"
            fill={voteStates.hasUpVote ? '#fff' : 'transparent'}
            width={20}
            height={20}
          />
        )}
      </TouchableOpacity>

      {/* Bouton Pouce Baissé */}
      <TouchableOpacity
        style={[
          styles.voteButton,
          voteStates.hasDownVote && styles.voteButtonActive,
          isVoting && styles.voteButtonDisabled,
        ]}
        onPress={handleDownVote}
        disabled={isVoting}
        activeOpacity={0.7}
      >
        {isVoting && votingType === 'down' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThumbsDown
            stroke="#fff"
            fill={voteStates.hasDownVote ? '#fff' : 'transparent'}
            width={20}
            height={20}
          />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
  },
  voteButton: {
    padding: 8,
    borderRadius: 20,

    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteButtonActive: {},
  voteButtonDisabled: {
    opacity: 0.6,
  },
})

export default React.memo(VoteButtons)
