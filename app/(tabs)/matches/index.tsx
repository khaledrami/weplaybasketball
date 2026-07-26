import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter, Link, useFocusEffect } from 'expo-router';
import { useTranslation } from '../../../lib/i18n';
import { useAuth } from '../../../lib/auth';
import { fetchUpcomingMatches } from '../../../lib/matches';
import { Match, Court } from '../../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';

type MatchWithCourt = Match & { court: Court };

export default function MatchesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'joined' | 'my'>('all');
  const [joinedMatchIds, setJoinedMatchIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [])
  );

  const loadMatches = async () => {
    setLoading(true);
    const data = await fetchUpcomingMatches();
    setMatches(data);

    if (user) {
      const { data: playerRows } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('user_id', user.id);
      setJoinedMatchIds(new Set(playerRows?.map((r) => r.match_id) ?? []));
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === 'all') return true;
    if (filter === 'my') return match.creator_id === user?.id;
    if (filter === 'joined') return joinedMatchIds.has(match.id);
    return true;
  });

  const renderMatch = ({ item }: { item: MatchWithCourt }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => router.push(`/(tabs)/matches/${item.id}`)}
    >
      <View style={styles.matchHeader}>
        <View style={styles.matchDate}>
          <Text style={styles.matchDay}>
            {format(new Date(item.scheduled_at), 'd')}
          </Text>
          <Text style={styles.matchMonth}>
            {format(new Date(item.scheduled_at), 'MMM').toUpperCase()}
          </Text>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{item.court.name}</Text>
          <Text style={styles.matchAddress}>{item.court.address || t('matches.defaultCity')}</Text>
          <Text style={styles.matchTime}>
            {format(new Date(item.scheduled_at), 'HH:mm')} • {item.duration_minutes}min
          </Text>
        </View>
        <View style={styles.matchMeta}>
          <View style={[styles.statusBadge, item.status === 'full' && styles.statusFull]}>
            <Text style={styles.statusText}>
              {item.status === 'full' ? t('matches.full') : t('matches.open')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.matchFooter}>
        <View style={styles.players}>
          <Ionicons name="people" size={16} color="#6C757D" />
          <Text style={styles.playersText}>
            {item.current_players}/{item.max_players}
          </Text>
        </View>

        {item.level_required && item.level_required !== 'any' && (
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={12} color="#E76F51" />
            <Text style={styles.levelText}>{item.level_required}</Text>
          </View>
        )}

        {item.language && (
          <View style={styles.langBadge}>
            <Text style={styles.langText}>{item.language.toUpperCase()}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('matches.title')}</Text>
        <Link href="/(tabs)/matches/create" asChild>
          <TouchableOpacity style={styles.createButton}>
            <Ionicons name="add" size={24} color="#E76F51" />
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.filters}>
        {(['all', 'joined', 'my'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filter, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {t(`matches.filter_${f}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatch}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E76F51']} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 64 }}>🏀</Text>
            <Text style={styles.emptyText}>{t('matches.empty')}</Text>
            <Text style={styles.emptySubtext}>{t('matches.emptySubtext')}</Text>
            <Link href="/(tabs)/matches/create" asChild>
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>{t('matches.create')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C2E',
  },
  createButton: {
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EDF2F7',
  },
  filterActive: {
    backgroundColor: '#1D3557',
  },
  filterText: {
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 24,
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchDate: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  matchDay: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E76F51',
  },
  matchMonth: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '600',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C2E',
    marginBottom: 4,
  },
  matchAddress: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 14,
    color: '#2D9CDB',
    fontWeight: '600',
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#2D9CDB',
  },
  statusFull: {
    backgroundColor: '#F39C12',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  matchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
  },
  players: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playersText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FEF3E2',
  },
  levelText: {
    fontSize: 12,
    color: '#E76F51',
    fontWeight: '600',
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E8F0FE',
  },
  langText: {
    fontSize: 12,
    color: '#1D3557',
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FEF3E2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E76F51',
  },
  createButtonText: {
    color: '#E76F51',
    fontSize: 16,
    fontWeight: '700',
  },
});