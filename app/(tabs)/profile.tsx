import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useProfile } from '../../lib/profile';
import { useTranslation } from '../../lib/i18n';
import { useTheme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { Position, DominantHand, SkillLevel } from '../../lib/types';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TrophyIcon, BasketballIcon, WhistleIcon } from '../../components/ui/Icons';
import { OnboardingModal } from '../../components/OnboardingModal';

export default function ProfileScreen() {
  const { t, locale, setLocale } = useTranslation();
  const { colors, gradients, spacing, borderRadius, typography, shadows, mode, setMode } = useTheme();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { profile, loading, updateProfile } = useProfile(userId || undefined);
  const [editing, setEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    age: '',
    height_cm: '',
    position: '' as Position | '',
    dominant_hand: '' as DominantHand | '',
    level: 'intermedi' as SkillLevel,
  });

  const POSITIONS = [
    { value: 'base' as Position, label: t('positions.base') },
    { value: 'aler' as Position, label: t('positions.aler') },
    { value: 'pivot' as Position, label: t('positions.pivot') },
    { value: 'flexible' as Position, label: t('positions.flexible') },
  ];

  const HANDS = [
    { value: 'left' as DominantHand, label: t('hands.left') },
    { value: 'right' as DominantHand, label: t('hands.right') },
    { value: 'ambidextrous' as DominantHand, label: t('hands.ambidextrous') },
  ];

  const LEVELS = [
    { value: 'muy_principiante' as SkillLevel, label: t('levels.muy_principiante') },
    { value: 'principiante' as SkillLevel, label: t('levels.principiante') },
    { value: 'intermedi' as SkillLevel, label: t('levels.intermedi') },
    { value: 'avancat' as SkillLevel, label: t('levels.avancat') },
    { value: 'competitiu' as SkillLevel, label: t('levels.competitiu') },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        age: profile.age?.toString() || '',
        height_cm: profile.height_cm?.toString() || '',
        position: profile.position || '',
        dominant_hand: profile.dominant_hand || '',
        level: profile.level || 'intermedi',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!formData.display_name.trim()) {
      setErrorMsg(t('profile.name_required'));
      return;
    }
    const success = await updateProfile({
      display_name: formData.display_name.trim(),
      age: formData.age ? parseInt(formData.age) : undefined,
      height_cm: formData.height_cm ? parseInt(formData.height_cm) : undefined,
      position: formData.position as Position || undefined,
      dominant_hand: formData.dominant_hand as DominantHand || undefined,
      level: formData.level,
    });
    if (success) {
      setEditing(false);
      setSuccessMsg(t('profile.updated'));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading && !profile) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.surfaceElevated }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surfaceElevated }]}
      contentContainerStyle={{ padding: spacing[6] }}
    >
      {/* Header Card */}
      <Card variant="elevated" style={{ marginBottom: spacing[6], overflow: 'hidden' }}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.headerGradient,
            { padding: spacing[6], borderRadius: borderRadius.xl },
          ]}
        >
          <View style={styles.headerContent}>
            <Avatar
              name={profile?.display_name}
              size="xxl"
              style={{ marginBottom: spacing[4] }}
            />
            <Text
              style={[
                styles.name,
                {
                  color: colors.textOnPrimary,
                  fontSize: typography.fontSizes.headlineLarge,
                  fontWeight: typography.fontWeights.bold,
                  marginBottom: spacing[2],
                },
              ]}
            >
              {profile?.display_name || t('profile.no_name')}
            </Text>
            <Badge variant="secondary" size="md">
              {t(`levels.${profile?.level || 'intermedi'}`)}
            </Badge>
            {profile?.position && (
              <Text
                style={[
                  styles.positionText,
                  {
                    color: colors.textOnPrimary,
                    opacity: 0.8,
                    fontSize: typography.fontSizes.bodyMedium,
                    marginTop: spacing[2],
                  },
                ]}
              >
                {t(`positions.${profile.position}`)} {profile.dominant_hand && `· ${t(`hands.${profile.dominant_hand}`)}`}
              </Text>
            )}
          </View>
        </LinearGradient>
      </Card>

      {/* Stats */}
      <View style={[styles.statsRow, { gap: spacing[3], marginBottom: spacing[6] }]}>
        <Card variant="filled" style={{ flex: 1, alignItems: 'center' }}>
          <TrophyIcon size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: typography.fontSizes.headlineMedium, fontWeight: typography.fontWeights.bold, marginTop: spacing[2] }]}>
            {profile?.matches_played || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium }]}>
            {t('profile.matches_played')}
          </Text>
        </Card>
        <Card variant="filled" style={{ flex: 1, alignItems: 'center' }}>
          <BasketballIcon size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: typography.fontSizes.headlineMedium, fontWeight: typography.fontWeights.bold, marginTop: spacing[2] }]}>
            {profile?.hours_played || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium }]}>
            {t('profile.hours_played')}
          </Text>
        </Card>
        <Card variant="filled" style={{ flex: 1, alignItems: 'center' }}>
          <WhistleIcon size={24} color={colors.secondary} />
          <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: typography.fontSizes.headlineMedium, fontWeight: typography.fontWeights.bold, marginTop: spacing[2] }]}>
            {profile?.mvp_count || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium }]}>
            {t('profile.mvp_count')}
          </Text>
        </Card>
      </View>

      {/* Attendance Rate */}
      <Card variant="outlined" style={{ marginBottom: spacing[6] }}>
        <View style={styles.attendanceContainer}>
          <View style={styles.attendanceHeader}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.bodyLarge, fontWeight: typography.fontWeights.semiBold }}>
              Assistència
            </Text>
            <Badge variant={profile?.attendance_rate && profile.attendance_rate >= 0.8 ? 'success' : 'warning'}>
              {Math.round((profile?.attendance_rate || 0) * 100)}%
            </Badge>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border, borderRadius: borderRadius.full, height: 8, marginTop: spacing[3] }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.success,
                  width: `${Math.round((profile?.attendance_rate || 0) * 100)}%`,
                  borderRadius: borderRadius.full,
                  height: 8,
                },
              ]}
            />
          </View>
        </View>
      </Card>

      {/* Badges / Insignias */}
      <Card variant="elevated" style={{ marginBottom: spacing[6] }}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.headlineSmall,
              fontWeight: typography.fontWeights.bold,
              marginBottom: spacing[4],
            },
          ]}
        >
          Insignies
        </Text>
        <View style={[styles.badgesContainer, { gap: spacing[3] }]}>
          {(profile?.mvp_count || 0) > 0 && (
            <Badge variant="warning" size="md">
              🏆 MVP x{profile?.mvp_count}
            </Badge>
          )}
          {(profile?.matches_played || 0) >= 10 && (
            <Badge variant="success" size="md">
              🔥 10+ Partits
            </Badge>
          )}
          {(profile?.hours_played || 0) >= 50 && (
            <Badge variant="primary" size="md">
              ⭐ Veteran
            </Badge>
          )}
          <Badge variant="neutral" size="md">
            🏀 Bàsquet
          </Badge>
        </View>
      </Card>

      {/* Edit Profile */}
      {!editing ? (
        <Card variant="outlined" style={{ marginBottom: spacing[6] }}>
          <View style={[styles.detailsContainer, { gap: spacing[3] }]}>
            {profile?.age && (
              <View style={styles.detailRow}>
                <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.bodyMedium }}>
                  {t('profile.age')}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.bodyMedium, fontWeight: typography.fontWeights.semiBold }}>
                  {profile.age} {t('profile.years')}
                </Text>
              </View>
            )}
            {profile?.height_cm && (
              <View style={styles.detailRow}>
                <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.bodyMedium }}>
                  {t('profile.height')}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: typography.fontSizes.bodyMedium, fontWeight: typography.fontWeights.semiBold }}>
                  {profile.height_cm} cm
                </Text>
              </View>
            )}
            <Button title={t('profile.edit')} variant="outline" onPress={() => setEditing(true)} />
          </View>
        </Card>
      ) : (
        <Card variant="elevated" style={{ marginBottom: spacing[6] }}>
          <View style={[styles.formContainer, { gap: spacing[4] }]}>
            <Input
              label={t('profile.name')}
              value={formData.display_name}
              onChangeText={(v) => setFormData({ ...formData, display_name: v })}
              error={errorMsg || undefined}
            />
            <Input
              label={t('profile.age')}
              value={formData.age}
              onChangeText={(v) => setFormData({ ...formData, age: v })}
              keyboardType="numeric"
            />
            <Input
              label={t('profile.height')}
              value={formData.height_cm}
              onChangeText={(v) => setFormData({ ...formData, height_cm: v })}
              keyboardType="numeric"
            />
            
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium, fontWeight: typography.fontWeights.medium, marginBottom: spacing[1] }}>
              {t('profile.position')}
            </Text>
            <View style={[styles.optionsRow, { gap: spacing[2], flexWrap: 'wrap' }]}>
              {POSITIONS.map((pos) => (
                <TouchableOpacity
                  key={pos.value}
                  style={[
                    styles.option,
                    {
                      backgroundColor: formData.position === pos.value ? colors.primary : colors.surfaceHover,
                      borderRadius: borderRadius.pill,
                      paddingHorizontal: spacing[4],
                      paddingVertical: spacing[2],
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, position: pos.value })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: formData.position === pos.value ? colors.textOnPrimary : colors.textPrimary,
                        fontSize: typography.fontSizes.bodyMedium,
                        fontWeight: typography.fontWeights.medium,
                      },
                    ]}
                  >
                    {pos.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium, fontWeight: typography.fontWeights.medium, marginBottom: spacing[1] }}>
              {t('profile.hand')}
            </Text>
            <View style={[styles.optionsRow, { gap: spacing[2], flexWrap: 'wrap' }]}>
              {HANDS.map((hand) => (
                <TouchableOpacity
                  key={hand.value}
                  style={[
                    styles.option,
                    {
                      backgroundColor: formData.dominant_hand === hand.value ? colors.primary : colors.surfaceHover,
                      borderRadius: borderRadius.pill,
                      paddingHorizontal: spacing[4],
                      paddingVertical: spacing[2],
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, dominant_hand: hand.value })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: formData.dominant_hand === hand.value ? colors.textOnPrimary : colors.textPrimary,
                        fontSize: typography.fontSizes.bodyMedium,
                        fontWeight: typography.fontWeights.medium,
                      },
                    ]}
                  >
                    {hand.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSizes.labelMedium, fontWeight: typography.fontWeights.medium, marginBottom: spacing[1] }}>
              {t('profile.level')}
            </Text>
            <View style={[styles.optionsRow, { gap: spacing[2], flexWrap: 'wrap' }]}>
              {LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.option,
                    {
                      backgroundColor: formData.level === level.value ? colors.secondary : colors.surfaceHover,
                      borderRadius: borderRadius.pill,
                      paddingHorizontal: spacing[4],
                      paddingVertical: spacing[2],
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, level: level.value })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: formData.level === level.value ? colors.textOnSecondary : colors.textPrimary,
                        fontSize: typography.fontSizes.bodyMedium,
                        fontWeight: typography.fontWeights.medium,
                      },
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.actionsRow, { gap: spacing[3], marginTop: spacing[2] }]}>
              <Button title={t('common.cancel')} variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
              <Button title={t('common.save')} variant="primary" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </Card>
      )}

      {/* Language */}
      <Card variant="outlined" style={{ marginBottom: spacing[6] }}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.headlineSmall,
              fontWeight: typography.fontWeights.bold,
              marginBottom: spacing[4],
            },
          ]}
        >
          {t('profile.language_selector')}
        </Text>
        <View style={[styles.languageRow, { gap: spacing[3] }]}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              {
                backgroundColor: locale === 'ca' ? colors.primary : colors.surfaceHover,
                borderRadius: borderRadius.lg,
                padding: spacing[3],
                borderWidth: 1,
                borderColor: locale === 'ca' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setLocale('ca')}
          >
            <Text
              style={[
                {
                  color: locale === 'ca' ? colors.textOnPrimary : colors.textPrimary,
                  fontSize: typography.fontSizes.bodyMedium,
                  fontWeight: typography.fontWeights.semiBold,
                },
              ]}
            >
              Català
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              {
                backgroundColor: locale === 'es' ? colors.primary : colors.surfaceHover,
                borderRadius: borderRadius.lg,
                padding: spacing[3],
                borderWidth: 1,
                borderColor: locale === 'es' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setLocale('es')}
          >
            <Text
              style={[
                {
                  color: locale === 'es' ? colors.textOnPrimary : colors.textPrimary,
                  fontSize: typography.fontSizes.bodyMedium,
                  fontWeight: typography.fontWeights.semiBold,
                },
              ]}
            >
              Castellano
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Theme */}
      <Card variant="outlined" style={{ marginBottom: spacing[6] }}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.headlineSmall,
              fontWeight: typography.fontWeights.bold,
              marginBottom: spacing[4],
            },
          ]}
        >
          {t('profile.theme')}
        </Text>
        <View style={[styles.languageRow, { gap: spacing[3] }]}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              {
                backgroundColor: mode === 'light' ? colors.primary : colors.surfaceHover,
                borderRadius: borderRadius.lg,
                padding: spacing[3],
                borderWidth: 1,
                borderColor: mode === 'light' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setMode('light')}
          >
            <Text
              style={[
                {
                  color: mode === 'light' ? colors.textOnPrimary : colors.textPrimary,
                  fontSize: typography.fontSizes.bodyMedium,
                  fontWeight: typography.fontWeights.semiBold,
                },
              ]}
            >
              {t('theme.light')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              {
                backgroundColor: mode === 'dark' ? colors.primary : colors.surfaceHover,
                borderRadius: borderRadius.lg,
                padding: spacing[3],
                borderWidth: 1,
                borderColor: mode === 'dark' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setMode('dark')}
          >
            <Text
              style={[
                {
                  color: mode === 'dark' ? colors.textOnPrimary : colors.textPrimary,
                  fontSize: typography.fontSizes.bodyMedium,
                  fontWeight: typography.fontWeights.semiBold,
                },
              ]}
            >
              {t('theme.dark')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              {
                backgroundColor: mode === 'system' ? colors.primary : colors.surfaceHover,
                borderRadius: borderRadius.lg,
                padding: spacing[3],
                borderWidth: 1,
                borderColor: mode === 'system' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setMode('system')}
          >
            <Text
              style={[
                {
                  color: mode === 'system' ? colors.textOnPrimary : colors.textPrimary,
                  fontSize: typography.fontSizes.bodyMedium,
                  fontWeight: typography.fontWeights.semiBold,
                },
              ]}
            >
              {t('theme.system')}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Help / Onboarding */}
      <Card variant="outlined" style={{ marginBottom: spacing[6] }}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSizes.headlineSmall,
              fontWeight: typography.fontWeights.bold,
              marginBottom: spacing[4],
            },
          ]}
        >
          {t('profile.help')}
        </Text>
        <Button
          title={t('profile.tour')}
          variant="outline"
          onPress={() => setShowOnboarding(true)}
          fullWidth
          leftIcon={<Text style={{ fontSize: 18 }}>🎯</Text>}
        />
      </Card>

      {/* Sign Out */}
      <Button title={t('profile.sign_out')} variant="danger" onPress={handleSignOut} fullWidth />

      <OnboardingModal visible={showOnboarding} onComplete={() => setShowOnboarding(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  name: {
    textAlign: 'center',
  },
  positionText: {
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statValue: {
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
  attendanceContainer: {
    width: '100%',
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 9999,
  },
  sectionTitle: {},
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  formContainer: {
    width: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
  },
  languageRow: {
    flexDirection: 'row',
  },
  languageButton: {
    flex: 1,
    alignItems: 'center',
  },
});