import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from '../../../lib/i18n';
import { useAuth } from '../../../lib/auth';
import { fetchUpcomingMatches } from '../../../lib/matches';
import { Match, Court } from '../../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type MatchWithCourt = Match & { court: Court };

export default function MatchesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'joined' | 'my'>('all');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    const data = await fetchUpcomingMatches();
    setMatches(data);
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
    // For 'joined', we'd need to check match_players - simplified for now
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
            {format(new Date(item.scheduled_at), 'MMM')}
          </Text>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{item.court.name}</Text>
          <Text style={styles.matchAddress}>{item.court.address || 'Badalona'}</Text>
          <Text style={styles.matchTime}>
            {format(new Date(item.scheduled_at), 'HH:mm')} • {item.duration_minutes}min
          </Text>
        </View>
        <View style={styles.matchMeta}>
          <View style={[styles.statusBadge, item.status === 'full' && styles.statusFull]}>
            <Text style={[styles.statusText, item.status === 'full' && styles.statusTextFull]}>
              {item.status === 'full' ? t('matches.full') : t('matches.open')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.matchFooter}>
        <View style={styles.players}>
          <Ionicons name="people" size={16} color="#8E8E93" />
          <Text style={styles.playersText}>
            {item.current_players}/{item.max_players}
          </Text>
        </View>

        {item.level_required && (
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={12} color="#FF9500" />
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
            <Ionicons name="add" size={24} color="#007AFF" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="basketball" size={48} color="#E5E5EA" />
            <Text style={styles.emptyText}>{t('matches.empty')}</Text>
            <Text style={styles.emptySubtext}>{t('matches.emptySubtext')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontWeight: 'bold',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F2F2F7',
  },
  filterActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
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
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchDate: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  matchDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  matchMonth: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchAddress: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#34C759',
  },
  statusFull: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextFull: {
    color: '#FFFFFF',
  },
  matchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  players: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playersText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
  },
  levelText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  langText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});
