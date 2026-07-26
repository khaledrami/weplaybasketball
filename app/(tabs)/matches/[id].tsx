import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from '../../../lib/i18n';
import { useAuth } from '../../../lib/auth';
import { fetchMatchById, joinMatch, leaveMatch, cancelMatch } from '../../../lib/matches';
import { Match, Court, Profile } from '../../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type MatchWithDetails = Match & {
  court: Court;
  players: (any & { profile: Profile })[];
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [match, setMatch] = useState<MatchWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) loadMatch();
  }, [id]);

  const loadMatch = async () => {
    if (!id) return;
    setLoading(true);
    const data = await fetchMatchById(id);
    setMatch(data);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!match || !user) return;
    setJoining(true);
    const success = await joinMatch(match.id);
    setJoining(false);

    if (success) {
      Alert.alert(t('common.done'), t('matches.joined'));
      loadMatch();
    } else {
      Alert.alert(t('common.error'), t('matches.joinError'));
    }
  };

  const handleLeave = async () => {
    if (!match || !user) return;

    Alert.alert(
      t('matches.leaveConfirmTitle'),
      t('matches.leaveConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            const success = await leaveMatch(match.id);
            if (success) {
              loadMatch();
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!match || !user) return;

    Alert.alert(
      t('matches.cancelConfirmTitle'),
      t('matches.cancelConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            const success = await cancelMatch(match.id);
            if (success) {
              Alert.alert(t('common.done'), t('matches.cancelled'));
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>{t('matches.notFound')}</Text>
      </View>
    );
  }

  const isCreator = user?.id === match.creator_id;
  const isPlayer = match.players?.some((p) => p.user_id === user?.id);
  const isFull = match.current_players >= match.max_players;
  const isWaitlisted = match.players?.some((p) => p.user_id === user?.id && p.role === 'waitlist');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('matches.details')}</Text>
      </View>

      <View style={styles.courtCard}>
        <View style={styles.courtHeader}>
          <Ionicons name="location" size={24} color="#007AFF" />
          <Text style={styles.courtName}>{match.court.name}</Text>
        </View>
        <Text style={styles.courtAddress}>{match.court.address}</Text>
        {match.court.barrio && (
          <Text style={styles.courtBarrio}>{match.court.barrio}</Text>
        )}
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={20} color="#8E8E93" />
          <Text style={styles.detailLabel}>{t('matches.date')}</Text>
          <Text style={styles.detailValue}>
            {format(new Date(match.scheduled_at), 'dd/MM/yyyy')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time" size={20} color="#8E8E93" />
          <Text style={styles.detailLabel}>{t('matches.time')}</Text>
          <Text style={styles.detailValue}>
            {format(new Date(match.scheduled_at), 'HH:mm')} • {match.duration_minutes}min
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people" size={20} color="#8E8E93" />
          <Text style={styles.detailLabel}>{t('matches.players')}</Text>
          <Text style={styles.detailValue}>
            {match.current_players}/{match.max_players}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="star" size={20} color="#8E8E93" />
          <Text style={styles.detailLabel}>{t('matches.level')}</Text>
          <Text style={styles.detailValue}>
            {match.level_required ? match.level_required : t('matches.anyLevel')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="language" size={20} color="#8E8E93" />
          <Text style={styles.detailLabel}>{t('matches.language')}</Text>
          <Text style={styles.detailValue}>
            {match.language === 'ca' ? 'Català' : match.language === 'es' ? 'Castellano' : t('matches.anyLanguage')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people-circle" size={20} color="#8E8E93" />
          <Text style={styles.detailLabel}>{t('matches.mixed')}</Text>
          <Text style={styles.detailValue}>
            {match.is_mixed ? t('common.yes') : t('common.no')}
          </Text>
        </View>
      </View>

      {match.description && (
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionLabel}>{t('matches.description')}</Text>
          <Text style={styles.descriptionText}>{match.description}</Text>
        </View>
      )}

      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>{t('matches.confirmedPlayers')}</Text>
        {match.players && match.players.length > 0 ? (
          match.players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerAvatar}>
                <Text style={styles.playerInitial}>
                  {player.profile?.display_name?.charAt(0) || '?'}
                </Text>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                  {player.profile?.display_name || t('profile.anonymous')}
                </Text>
                {player.profile?.level && (
                  <Text style={styles.playerLevel}>{player.profile.level}</Text>
                )}
              </View>
              {player.user_id === match.creator_id && (
                <View style={styles.creatorBadge}>
                  <Text style={styles.creatorText}>{t('matches.creator')}</Text>
                </View>
              )}
              {player.role === 'waitlist' && (
                <View style={styles.waitlistBadge}>
                  <Text style={styles.waitlistText}>{t('matches.waitlist')}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noPlayers}>{t('matches.noPlayers')}</Text>
        )}
      </View>

      <View style={styles.actions}>
        {!isPlayer && !isFull && (
          <TouchableOpacity
            style={[styles.joinButton, joining && styles.joinButtonDisabled]}
            onPress={handleJoin}
            disabled={joining}
          >
            <Text style={styles.joinButtonText}>
              {joining ? t('common.loading') : t('matches.join')}
            </Text>
          </TouchableOpacity>
        )}

        {!isPlayer && isFull && !isWaitlisted && (
          <TouchableOpacity
            style={[styles.joinButton, joining && styles.joinButtonDisabled]}
            onPress={handleJoin}
            disabled={joining}
          >
            <Text style={styles.joinButtonText}>
              {joining ? t('common.loading') : t('matches.joinWaitlist')}
            </Text>
          </TouchableOpacity>
        )}

        {isPlayer && !isCreator && (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
            <Text style={styles.leaveButtonText}>{t('matches.leave')}</Text>
          </TouchableOpacity>
        )}

        {isCreator && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>{t('matches.cancelMatch')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  courtCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  courtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '600',
  },
  courtAddress: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  courtBarrio: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailsCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  detailLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  playersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  playerLevel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  creatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
  },
  creatorText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  waitlistBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  waitlistText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  noPlayers: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    padding: 24,
  },
  actions: {
    gap: 12,
  },
  joinButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
