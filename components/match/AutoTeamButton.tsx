import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../lib/i18n';
import { autoBalanceTeams, resetTeams, getTeamBalanceInfo } from '../../lib/team-balance';

interface AutoTeamButtonProps {
  matchId: string;
  playerCount: number;
  onTeamsCreated: () => void;
}

export default function AutoTeamButton({ matchId, playerCount, onTeamsCreated }: AutoTeamButtonProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [teamsCreated, setTeamsCreated] = useState(false);

  const handleAutoBalance = async () => {
    if (playerCount < 2) {
      Alert.alert(t('common.error'), t('teams.notEnoughPlayers'));
      return;
    }

    Alert.alert(
      t('teams.autoBalanceTitle'),
      t('teams.autoBalanceMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('teams.create'),
          onPress: async () => {
            setLoading(true);
            const result = await autoBalanceTeams(matchId);
            setLoading(false);

            if (result) {
              const info = getTeamBalanceInfo(result.teamA, result.teamB, result.scoreA, result.scoreB);
              setTeamsCreated(true);
              onTeamsCreated();

              Alert.alert(
                info.isBalanced ? t('teams.balanced') : t('teams.unbalanced'),
                `${info.message}\n\n${t('teams.teamA')}: ${result.teamA.length} ${t('matches.players')}\n${t('teams.teamB')}: ${result.teamB.length} ${t('matches.players')}`
              );
            } else {
              Alert.alert(t('common.error'), t('teams.error'));
            }
          },
        },
      ]
    );
  };

  const handleReset = async () => {
    Alert.alert(
      t('teams.resetTitle'),
      t('teams.resetMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('teams.reset'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await resetTeams(matchId);
            setLoading(false);

            if (success) {
              setTeamsCreated(false);
              onTeamsCreated();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>{t('teams.creating')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!teamsCreated ? (
        <TouchableOpacity style={styles.createButton} onPress={handleAutoBalance}>
          <Ionicons name="people-circle" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>{t('matches.auto_teams')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh-circle" size={24} color="#FF3B30" />
          <Text style={styles.resetButtonText}>{t('teams.reset')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#34C759',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  resetButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
