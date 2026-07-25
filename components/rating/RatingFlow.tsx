import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../lib/i18n';
import { getPendingRatings, submitRatings, RatingInput } from '../../lib/rating-helpers';
import { Profile } from '../../lib/types';

interface RatingFlowProps {
  matchId: string;
  onComplete: () => void;
  onSkip: () => void;
}

interface PlayerRating extends Profile {
  punctuality: number;
  sportsmanship: number;
  actual_level: number;
  already_rated: boolean;
}

export default function RatingFlow({ matchId, onComplete, onSkip }: RatingFlowProps) {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<PlayerRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadPlayers();
  }, [matchId]);

  const loadPlayers = async () => {
    setLoading(true);
    const pendingPlayers = await getPendingRatings(matchId);
    const playersWithRating = pendingPlayers.map(p => ({
      ...p,
      punctuality: 0,
      sportsmanship: 0,
      actual_level: 0,
    }));
    setPlayers(playersWithRating);
    setLoading(false);
  };

  const handleRate = (field: 'punctuality' | 'sportsmanship' | 'actual_level', value: number) => {
    setPlayers(prev => prev.map((p, i) =>
      i === currentIndex ? { ...p, [field]: value } : p
    ));
  };

  const handleNext = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const ratingsToSubmit: RatingInput[] = players
      .filter(p => !p.already_rated && (p.punctuality > 0 || p.sportsmanship > 0 || p.actual_level > 0))
      .map(p => ({
        rated_id: p.id,
        punctuality: p.punctuality || 3,
        sportsmanship: p.sportsmanship || 3,
        actual_level: p.actual_level || 3,
      }));

    if (ratingsToSubmit.length > 0) {
      const success = await submitRatings(matchId, ratingsToSubmit);
      if (success) {
        onComplete();
      } else {
        Alert.alert(t('common.error'), t('rating.error'));
      }
    } else {
      onComplete();
    }

    setSubmitting(false);
  };

  const handleSkip = () => {
    Alert.alert(
      t('rating.skipTitle'),
      t('rating.skipMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('rating.skip'), onPress: onSkip },
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

  if (players.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="checkmark-circle" size={64} color="#34C759" />
        <Text style={styles.emptyTitle}>{t('rating.allRated')}</Text>
        <Text style={styles.emptySubtitle}>{t('rating.allRatedSubtitle')}</Text>
        <TouchableOpacity style={styles.doneButton} onPress={onComplete}>
          <Text style={styles.doneButtonText}>{t('common.done')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentPlayer = players[currentIndex];
  const hasRated = currentPlayer.already_rated ||
    (currentPlayer.punctuality > 0 || currentPlayer.sportsmanship > 0 || currentPlayer.actual_level > 0);
  const isLast = currentIndex === players.length - 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('rating.title')}</Text>
        <Text style={styles.subtitle}>
          {t('rating.progress', { current: currentIndex + 1, total: players.length })}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / players.length) * 100}%` }]} />
      </View>

      <View style={styles.playerCard}>
        <View style={styles.playerAvatar}>
          <Text style={styles.playerInitial}>
            {currentPlayer.display_name?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.playerName}>{currentPlayer.display_name || t('profile.anonymous')}</Text>
        <Text style={styles.playerLevel}>{currentPlayer.level}</Text>

        {currentPlayer.already_rated ? (
          <View style={styles.alreadyRatedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.alreadyRatedText}>{t('rating.alreadyRated')}</Text>
          </View>
        ) : (
          <View style={styles.ratingSection}>
            <View style={styles.ratingCategory}>
              <Text style={styles.ratingLabel}>{t('rating.punctuality')}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRate('punctuality', star)}
                  >
                    <Ionicons
                      name={star <= currentPlayer.punctuality ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= currentPlayer.punctuality ? '#FF9500' : '#E5E5EA'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingCategory}>
              <Text style={styles.ratingLabel}>{t('rating.sportsmanship')}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRate('sportsmanship', star)}
                  >
                    <Ionicons
                      name={star <= currentPlayer.sportsmanship ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= currentPlayer.sportsmanship ? '#FF9500' : '#E5E5EA'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingCategory}>
              <Text style={styles.ratingLabel}>{t('rating.actualLevel')}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRate('actual_level', star)}
                  >
                    <Ionicons
                      name={star <= currentPlayer.actual_level ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= currentPlayer.actual_level ? '#FF9500' : '#E5E5EA'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, submitting && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={submitting}
        >
          <Text style={styles.nextButtonText}>
            {submitting
              ? t('common.loading')
              : isLast
                ? t('rating.submit')
                : t('common.next')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>{t('rating.skip')}</Text>
      </TouchableOpacity>
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  playerCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  playerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerInitial: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  playerName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  playerLevel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  alreadyRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },
  alreadyRatedText: {
    color: '#34C759',
    fontWeight: '500',
  },
  ratingSection: {
    width: '100%',
    gap: 20,
  },
  ratingCategory: {
    gap: 8,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
