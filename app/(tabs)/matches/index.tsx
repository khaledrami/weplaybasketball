import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Image } from 'react-native';
import { useRouter, Link, useFocusEffect } from 'expo-router';
import { useTranslation } from '../../../lib/i18n';
import { useAuth } from '../../../lib/auth';
import { useTheme } from '../../../lib/theme';
import { fetchUpcomingMatches } from '../../../lib/matches';
import { Match, Court } from '../../../lib/types';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { BasketballIcon, WhistleIcon } from '../../../components/ui/Icons';
import { EmptyStateIllustration } from '../../../components/ui/Illustrations';

type MatchWithCourt = Match & { court: Court };

export default function MatchesScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, typography, matchStatusColors, shadows } = useTheme();
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
      setJoinedMatchIds(new Set(playerRows?.map((r: { match_id: string }) => r.match_id) ?? []));
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

  const getStatusBadge = (match: MatchWithCourt) => {
    if (match.current_players >= match.max_players) {
      return <Badge variant="danger" size="sm">{t('matches.full')}</Badge>;
    }
    if (joinedMatchIds.has(match.id)) {
      return <Badge variant="success" size="sm">✓ {t('matches.joined')}</Badge>;
    }
    if (match.status === 'open') {
      return <Badge variant="success" size="sm">{t('matches.open')}</Badge>;
    }
    return <Badge variant="warning" size="sm">{match.status}</Badge>;
  };

  const renderMatch = ({ item }: { item: MatchWithCourt }) => {
    const date = new Date(item.scheduled_at);
    const day = format(date, 'd');
    const month = format(date, 'MMM').toUpperCase();
    const time = format(date, 'HH:mm');
    const isFull = item.current_players >= item.max_players;
    const isJoined = joinedMatchIds.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.matchCard,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            marginBottom: spacing[3],
            ...shadows.level2,
          },
        ]}
        onPress={() => router.push(`/(tabs)/matches/${item.id}`)}
        activeOpacity={0.9}
      >
        {/* Card Header - Date & Status */}
        <View style={[styles.cardHeader, { padding: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <View style={[styles.dateContainer, { backgroundColor: colors.surfaceHover, borderRadius: borderRadius.lg, padding: spacing[3], minWidth: 56, alignItems: 'center' }]}>
            <Text style={{ color: colors.secondary, fontSize: typography.fontSizes.headlineMedium, fontWeight: typography.fontWeights.bold }}>
              {day}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium, fontWeight: typography.fontWeights.medium }}>
              {month}
            </Text>
          </View>

          <View style={[styles.cardInfo, { marginLeft: spacing[3], flex: 1 }]}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.bodyLarge, fontWeight: typography.fontWeights.semiBold }} numberOfLines={1}>
              {item.court.name}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.bodySmall, marginTop: spacing[1] }}>
              {item.court.address || t('matches.defaultCity')}
            </Text>
            <View style={[styles.metaRow, { flexDirection: 'row', marginTop: spacing[2], gap: spacing[2] }]}>
              {getStatusBadge(item)}
              {item.level_required && (
                <Badge variant="neutral" size="sm">⭐ {item.level_required}</Badge>
              )}
              {item.language && (
                <Badge variant="neutral" size="sm">🌐 {item.language.toUpperCase()}</Badge>
              )}
            </View>
          </View>
        </View>

        {/* Card Body - Details */}
        <View style={[styles.cardBody, { padding: spacing[4] }]}>
          <View style={[styles.detailsRow, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <View style={[styles.detailItem, { alignItems: 'center' }]}>
              <Text style={{ fontSize: 20 }}>⏰</Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.bodyMedium, fontWeight: typography.fontWeights.semiBold, marginTop: spacing[1] }}>
                {time}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium }}>
                {item.duration_minutes}min
              </Text>
            </View>

            <View style={[styles.detailItem, { alignItems: 'center' }]}>
              <Text style={{ fontSize: 20 }}>🏀</Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.bodyMedium, fontWeight: typography.fontWeights.semiBold, marginTop: spacing[1] }}>
                {item.current_players}/{item.max_players}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium }}>
                {t('matches.players')}
              </Text>
            </View>

            <View style={[styles.detailItem, { alignItems: 'center' }]}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.bodyMedium, fontWeight: typography.fontWeights.semiBold, marginTop: spacing[1] }}>
                {item.court.barrio || 'Badalona'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium }}>
                Barri
              </Text>
            </View>
          </View>
        </View>

        {/* Card Footer - Avatars & Action */}
        <View style={[styles.cardFooter, { padding: spacing[3], paddingHorizontal: spacing[4], borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={[styles.avatarsRow, { flexDirection: 'row', gap: -spacing[2] }]}>
            {Array.from({ length: Math.min(item.current_players, 5) }).map((_, i) => (
              <Avatar
                key={i}
                name={`Player ${i + 1}`}
                size="xs"
                style={{ marginLeft: i > 0 ? -8 : 0, borderWidth: 2, borderColor: colors.surface }}
              />
            ))}
            {item.current_players > 5 && (
              <View style={[styles.morePlayers, { backgroundColor: colors.surfaceHover, borderRadius: borderRadius.full, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginLeft: -8, borderWidth: 2, borderColor: colors.surface }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: typography.fontWeights.bold }}>
                  +{item.current_players - 5}
                </Text>
              </View>
            )}
          </View>

          {!isFull && !isJoined && (
            <Badge variant="primary" size="sm">
              👋 {t('matches.join')}
            </Badge>
          )}
          {isJoined && (
            <Badge variant="success" size="sm">
              ✓ {t('matches.joined')}
            </Badge>
          )}
          {isFull && !isJoined && (
            <Badge variant="warning" size="sm">
              📝 {t('matches.joinWaitlist')}
            </Badge>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceElevated }]}>
      {/* Header */}
      <View style={[styles.header, { padding: spacing[6], paddingTop: spacing[8] }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.fontSizes.displaySmall, fontWeight: typography.fontWeights.bold }]}>
              {t('matches.title')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.bodyMedium, marginTop: spacing[1] }}>
              Troba el teu proper partit
            </Text>
          </View>
          <Link href="/(tabs)/matches/create" asChild>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.createButton,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: borderRadius.full,
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...shadows.level3,
                },
              ])}
            >
              <Text style={{ color: colors.textOnSecondary, fontSize: 24, fontWeight: typography.fontWeights.bold }}>+</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Filters */}
        <View style={[styles.filters, { flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] }]}>
          {(['all', 'joined', 'my'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filter,
                {
                  backgroundColor: filter === f ? colors.primary : colors.surfaceHover,
                  borderRadius: borderRadius.pill,
                  paddingHorizontal: spacing[4],
                  paddingVertical: spacing[2],
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.filterText,
                {
                  color: filter === f ? colors.textOnPrimary : colors.textPrimary,
                  fontSize: typography.fontSizes.bodyMedium,
                  fontWeight: typography.fontWeights.medium,
                },
              ]}>
                {t(`matches.filter_${f}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Match List */}
      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatch}
        contentContainerStyle={{ padding: spacing[4], paddingTop: 0 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />
        }
        ListEmptyComponent={
          <View style={[styles.empty, { padding: spacing[12], alignItems: 'center' }]}>
            <EmptyStateIllustration type="no-matches" size={200} />
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.bodyLarge, fontWeight: typography.fontWeights.semiBold, marginTop: spacing[4] }}>
              {t('matches.empty')}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSizes.bodyMedium, marginTop: spacing[2], textAlign: 'center' }}>
              {t('matches.emptySubtext')}
            </Text>
            <Button
              title={t('matches.create')}
              variant="primary"
              onPress={() => router.push('/(tabs)/matches/create')}
              style={{ marginTop: spacing[6] }}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  title: {},
  createButton: {},
  filters: {},
  filter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    textAlign: 'center',
  },
  matchCard: {
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardBody: {},
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  morePlayers: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
  },
});