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
import AutoTeamButton from '../../../components/match/AutoTeamButton';
import RatingFlow from '../../../components/rating/RatingFlow';

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
  const [showRatingFlow, setShowRatingFlow] = useState(false);

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
        <ActivityIndicator size="large" color="#E76F51" />
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
          <Ionicons name="arrow-back" size={24} color="#1D3557" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('matches.details')}</Text>
      </View>

      <View style={styles.courtCard}>
        <View style={styles.courtHeader}>
          <Ionicons name="location" size={24} color="#1D3557" />
          <Text style={styles.courtName}>{match.court.name}</Text>
        </View>
        <Text style={styles.courtAddress}>{match.court.address || t('matches.defaultCity')}</Text>
        {match.court.barrio && (
          <Text style={styles.courtBarrio}>{match.court.barrio}</Text>
        )}
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={20} color="#1D3557" />
          <Text style={styles.detailLabel}>{t('matches.date')}</Text>
          <Text style={styles.detailValue}>
            {format(new Date(match.scheduled_at), 'dd/MM/yyyy')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time" size={20} color="#1D3557" />
          <Text style={styles.detailLabel}>{t('matches.time')}</Text>
          <Text style={styles.detailValue}>
            {format(new Date(match.scheduled_at), 'HH:mm')} • {match.duration_minutes}min
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people" size={20} color="#1D3557" />
          <Text style={styles.detailLabel}>{t('matches.players')}</Text>
          <Text style={styles.detailValue}>
            {match.current_players}/{match.max_players}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="star" size={20} color="#1D3557" />
          <Text style={styles.detailLabel}>{t('matches.level')}</Text>
          <Text style={styles.detailValue}>
            {match.level_required ? match.level_required : t('matches.anyLevel')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="language" size={20} color="#1D3557" />
          <Text style={styles.detailLabel}>{t('matches.language')}</Text>
          <Text style={styles.detailValue}>
            {match.language === 'ca' ? t('matches.langCatalan') : match.language === 'es' ? t('matches.langSpanish') : t('matches.anyLanguage')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people-circle" size={20} color="#1D3557" />
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
                  {player.profile?.display_name?.charAt(0) || '🏀'}
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

      {showRatingFlow && match && (
        <RatingFlow
          matchId={match.id}
          onComplete={() => { setShowRatingFlow(false); loadMatch(); }}
          onSkip={() => setShowRatingFlow(false)}
        />
      )}

      {isCreator && match.status === 'in_progress' && (
        <AutoTeamButton
          matchId={match.id}
          playerCount={match.current_players}
          onTeamsCreated={loadMatch}
        />
      )}

      {isPlayer && match.status === 'completed' && !showRatingFlow && (
        <TouchableOpacity style={styles.rateButton} onPress={() => setShowRatingFlow(true)}>
          <Ionicons name="star" size={20} color="#FFFFFF" />
          <Text style={styles.rateButtonText}>{t('rating.title')}</Text>
        </TouchableOpacity>
      )}

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
    backgroundColor: '#F8F9FA',
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
    color: '#6C757D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C2E',
  },
  courtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  courtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  courtName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C2E',
  },
  courtAddress: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  courtBarrio: {
    fontSize: 14,
    color: '#E76F51',
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  detailLabel: {
    flex: 1,
    marginLeft: 14,
    fontSize: 14,
    color: '#6C757D',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C2E',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1C1C2E',
  },
  playersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C2E',
    marginBottom: 14,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1D3557',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  playerInitial: {
    fontSize: 18,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C2E',
    marginBottom: 2,
  },
  playerLevel: {
    fontSize: 12,
    color: '#E76F51',
    fontWeight: '500',
  },
  creatorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FEF3E2',
  },
  creatorText: {
    fontSize: 11,
    color: '#E76F51',
    fontWeight: '600',
  },
  waitlistBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
  },
  waitlistText: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '600',
  },
  noPlayers: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    padding: 24,
  },
  actions: {
    gap: 12,
  },
  joinButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#E76F51',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  leaveButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontSize: 17,
    fontWeight: '700',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F4A261',
    marginBottom: 12,
    shadowColor: '#F4A261',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});