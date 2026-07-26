import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '../../lib/profile';
import { useTranslation } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { Position, DominantHand, SkillLevel } from '../../lib/types';

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'base', label: 'Base' },
  { value: 'aler', label: 'Aler' },
  { value: 'pivot', label: 'Pivot' },
  { value: 'flexible', label: 'Flexible' },
];

const HANDS: { value: DominantHand; label: string }[] = [
  { value: 'left', label: 'Esquerra' },
  { value: 'right', label: 'Dreta' },
  { value: 'ambidextrous', label: 'Ambidextre' },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { createProfile } = useProfile(userId || undefined);
  const [formData, setFormData] = useState({
    display_name: '',
    age: '',
    height_cm: '',
    position: '' as Position | '',
    dominant_hand: '' as DominantHand | '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const handleComplete = async () => {
    if (!formData.display_name.trim()) {
      Alert.alert(t('common.error'), 'El nom és obligatori');
      return;
    }

    const success = await createProfile({
      display_name: formData.display_name.trim(),
      age: formData.age ? parseInt(formData.age) : undefined,
      height_cm: formData.height_cm ? parseInt(formData.height_cm) : undefined,
      position: formData.position as Position || undefined,
      dominant_hand: formData.dominant_hand as DominantHand || undefined,
      level: 'intermedi',
    });

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert(t('common.error'), 'Error al crear el perfil');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Benvingut a WePlayBasketball</Text>
      <Text style={styles.subtitle}>Completa el teu perfil per començar</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{t('profile.name')} *</Text>
        <TextInput
          style={styles.input}
          value={formData.display_name}
          onChangeText={(v) => setFormData({ ...formData, display_name: v })}
          placeholder="El teu nom"
        />

        <Text style={styles.label}>{t('profile.age')}</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(v) => setFormData({ ...formData, age: v })}
          keyboardType="numeric"
          placeholder="La teva edat"
        />

        <Text style={styles.label}>{t('profile.height')}</Text>
        <TextInput
          style={styles.input}
          value={formData.height_cm}
          onChangeText={(v) => setFormData({ ...formData, height_cm: v })}
          keyboardType="numeric"
          placeholder="La teva alçada en cm"
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
      </View>

      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>{t('common.done')}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8E8E93',
    marginBottom: 32,
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
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
