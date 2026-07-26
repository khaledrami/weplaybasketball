import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useProfile } from '../../lib/profile';
import { useTranslation } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Position, DominantHand, SkillLevel } from '../../lib/types';

export default function ProfileScreen() {
  const { t, locale, setLocale } = useTranslation();
  const [userId, setUserId] = useState<string | null>(null);
  const { profile, loading, updateProfile } = useProfile(userId || undefined);
  const [editing, setEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    age: '',
    height_cm: '',
    position: '' as Position | '',
    dominant_hand: '' as DominantHand | '',
    level: 'intermedi' as SkillLevel,
  });

  const POSITIONS = useMemo(() => [
    { value: 'base' as Position, label: t('positions.base') },
    { value: 'aler' as Position, label: t('positions.aler') },
    { value: 'pivot' as Position, label: t('positions.pivot') },
    { value: 'flexible' as Position, label: t('positions.flexible') },
  ], [t]);

  const HANDS = useMemo(() => [
    { value: 'left' as DominantHand, label: t('hands.left') },
    { value: 'right' as DominantHand, label: t('hands.right') },
    { value: 'ambidextrous' as DominantHand, label: t('hands.ambidextrous') },
  ], [t]);

  const LEVELS = useMemo(() => [
    { value: 'muy_principiante' as SkillLevel, label: t('levels.muy_principiante') },
    { value: 'principiante' as SkillLevel, label: t('levels.principiante') },
    { value: 'intermedi' as SkillLevel, label: t('levels.intermedi') },
    { value: 'avancat' as SkillLevel, label: t('levels.avancat') },
    { value: 'competitiu' as SkillLevel, label: t('levels.competitiu') },
  ], [t]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.display_name?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.display_name || t('profile.no_name')}</Text>
        <Text style={styles.level}>
          {t(`levels.${profile?.level || 'intermedi'}`)}
        </Text>
      </View>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {successMsg ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      ) : null}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile?.matches_played || 0}</Text>
          <Text style={styles.statLabel}>{t('profile.matches_played')}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile?.hours_played || 0}</Text>
          <Text style={styles.statLabel}>{t('profile.hours_played')}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile?.mvp_count || 0}</Text>
          <Text style={styles.statLabel}>{t('profile.mvp_count')}</Text>
        </View>
      </View>

      {editing ? (
        <View style={styles.form}>
          <Text style={styles.label}>{t('profile.name')}</Text>
          <TextInput
            style={styles.input}
            value={formData.display_name}
            onChangeText={(v) => setFormData({ ...formData, display_name: v })}
          />

          <Text style={styles.label}>{t('profile.age')}</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(v) => setFormData({ ...formData, age: v })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>{t('profile.height')}</Text>
          <TextInput
            style={styles.input}
            value={formData.height_cm}
            onChangeText={(v) => setFormData({ ...formData, height_cm: v })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>{t('profile.position')}</Text>
          <View style={styles.options}>
            {POSITIONS.map((pos) => (
              <TouchableOpacity
                key={pos.value}
                style={[styles.option, formData.position === pos.value && styles.optionSelected]}
                onPress={() => setFormData({ ...formData, position: pos.value })}
              >
                <Text style={[styles.optionText, formData.position === pos.value && styles.optionTextSelected]}>
                  {pos.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('profile.hand')}</Text>
          <View style={styles.options}>
            {HANDS.map((hand) => (
              <TouchableOpacity
                key={hand.value}
                style={[styles.option, formData.dominant_hand === hand.value && styles.optionSelected]}
                onPress={() => setFormData({ ...formData, dominant_hand: hand.value })}
              >
                <Text style={[styles.optionText, formData.dominant_hand === hand.value && styles.optionTextSelected]}>
                  {hand.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('profile.level')}</Text>
          <View style={styles.options}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[styles.option, formData.level === level.value && styles.optionSelected]}
                onPress={() => setFormData({ ...formData, level: level.value })}
              >
                <Text style={[styles.optionText, formData.level === level.value && styles.optionTextSelected]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.details}>
          {profile?.age && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('profile.age')}</Text>
              <Text style={styles.detailValue}>{profile.age} {t('profile.years')}</Text>
            </View>
          )}
          {profile?.height_cm && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('profile.height')}</Text>
              <Text style={styles.detailValue}>{profile.height_cm} cm</Text>
            </View>
          )}
          {profile?.position && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('profile.position')}</Text>
              <Text style={styles.detailValue}>{t(`positions.${profile.position}`)}</Text>
            </View>
          )}
          {profile?.dominant_hand && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('profile.hand')}</Text>
              <Text style={styles.detailValue}>{t(`hands.${profile.dominant_hand}`)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={() => { setErrorMsg(null); setSuccessMsg(null); setEditing(true); }}>
            <Text style={styles.editButtonText}>{t('profile.edit')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.languageSection}>
        <Text style={styles.languageLabel}>{t('profile.language_selector')}</Text>
        <View style={styles.languageRow}>
          <TouchableOpacity
            style={[styles.languageButton, locale === 'ca' && styles.languageButtonActive]}
            onPress={() => setLocale('ca')}
          >
            <Text style={[styles.languageButtonText, locale === 'ca' && styles.languageButtonTextActive]}>
              Català
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, locale === 'es' && styles.languageButtonActive]}
            onPress={() => setLocale('es')}
          >
            <Text style={[styles.languageButtonText, locale === 'es' && styles.languageButtonTextActive]}>
              Castellano
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>{t('profile.sign_out')}</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  level: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorBox: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#F0FFF0',
    borderWidth: 1,
    borderColor: '#34C759',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#34C759',
    fontSize: 14,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#F2F2F7',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F2F2F7',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#000000',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 32,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  signOutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  languageSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  languageButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
  },
});
