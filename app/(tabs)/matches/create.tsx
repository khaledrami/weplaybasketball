import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../lib/i18n';
import { createMatch } from '../../../lib/matches';
import { fetchCourts } from '../../../lib/courts';
import { Court, SkillLevel } from '../../../lib/types';
import { Ionicons } from '@expo/vector-icons';

const LEVELS: { value: SkillLevel | 'any'; label: string }[] = [
  { value: 'any', label: 'Qualsevol' },
  { value: 'muy_principiante', label: 'Molt principiant' },
  { value: 'principiante', label: 'Principiant' },
  { value: 'intermedi', label: 'Intermedi' },
  { value: 'avancat', label: 'Avançat' },
  { value: 'competitiu', label: 'Competitiu' },
];

const DURATIONS = [30, 45, 60, 90, 120];
const MAX_PLAYERS = [4, 6, 8, 10, 12];

export default function CreateMatchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [courts, setCourts] = useState<Court[]>([]);
  const [showCourtPicker, setShowCourtPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    court: null as Court | null,
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    duration: 60,
    maxPlayers: 10,
    level: 'any' as SkillLevel | 'any',
    language: 'ca',
    isMixed: true,
    description: '',
  });

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    const data = await fetchCourts();
    setCourts(data);
  };

  const handleCreate = async () => {
    if (!formData.court) {
      Alert.alert(t('common.error'), 'Selecciona una pista');
      return;
    }

    if (!formData.date || !formData.time) {
      Alert.alert(t('common.error'), 'Selecciona data i hora');
      return;
    }

    const scheduledAt = new Date(`${formData.date}T${formData.time}:00`);
    if (scheduledAt <= new Date()) {
      Alert.alert(t('common.error'), 'La data i hora han de ser futures');
      return;
    }

    setLoading(true);

    const match = await createMatch({
      court_id: formData.court.id,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: formData.duration,
      max_players: formData.maxPlayers,
      level_required: formData.level === 'any' ? undefined : formData.level,
      language: formData.language,
      is_mixed: formData.isMixed,
      description: formData.description || undefined,
    });

    setLoading(false);

    if (match) {
      Alert.alert(t('common.done'), 'Partit creat!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert(t('common.error'), 'Error al crear el partit');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('matches.create')}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{t('matches.court')} *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowCourtPicker(true)}
        >
          <Text style={formData.court ? styles.pickerText : styles.pickerPlaceholder}>
            {formData.court ? formData.court.name : 'Seleccionar pista...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#8E8E93" />
        </TouchableOpacity>

        <Text style={styles.label}>{t('matches.date')} *</Text>
        <TextInput
          style={styles.input}
          value={formData.date}
          onChangeText={(v) => setFormData({ ...formData, date: v })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>{t('matches.time')} *</Text>
        <TextInput
          style={styles.input}
          value={formData.time}
          onChangeText={(v) => setFormData({ ...formData, time: v })}
          placeholder="HH:MM"
        />

        <Text style={styles.label}>{t('matches.duration')}</Text>
        <View style={styles.optionsRow}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.option, formData.duration === d && styles.optionSelected]}
              onPress={() => setFormData({ ...formData, duration: d })}
            >
              <Text style={[styles.optionText, formData.duration === d && styles.optionTextSelected]}>
                {d}min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('matches.players')}</Text>
        <View style={styles.optionsRow}>
          {MAX_PLAYERS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.option, formData.maxPlayers === p && styles.optionSelected]}
              onPress={() => setFormData({ ...formData, maxPlayers: p })}
            >
              <Text style={[styles.optionText, formData.maxPlayers === p && styles.optionTextSelected]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('matches.level')}</Text>
        <View style={styles.optionsWrap}>
          {LEVELS.map((l) => (
            <TouchableOpacity
              key={l.value}
              style={[styles.option, formData.level === l.value && styles.optionSelected]}
              onPress={() => setFormData({ ...formData, level: l.value })}
            >
              <Text style={[styles.optionText, formData.level === l.value && styles.optionTextSelected]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('matches.language')}</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.option, formData.language === 'ca' && styles.optionSelected]}
            onPress={() => setFormData({ ...formData, language: 'ca' })}
          >
            <Text style={[styles.optionText, formData.language === 'ca' && styles.optionTextSelected]}>
              Català
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, formData.language === 'es' && styles.optionSelected]}
            onPress={() => setFormData({ ...formData, language: 'es' })}
          >
            <Text style={[styles.optionText, formData.language === 'es' && styles.optionTextSelected]}>
              Castellano
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, formData.language === 'any' && styles.optionSelected]}
            onPress={() => setFormData({ ...formData, language: 'any' })}
          >
            <Text style={[styles.optionText, formData.language === 'any' && styles.optionTextSelected]}>
              Qualsevol
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setFormData({ ...formData, isMixed: !formData.isMixed })}
        >
          <Text style={styles.toggleLabel}>{t('matches.mixed')}</Text>
          <View style={[styles.toggle, formData.isMixed && styles.toggleActive]}>
            <View style={[styles.toggleDot, formData.isMixed && styles.toggleDotActive]} />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>{t('matches.description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(v) => setFormData({ ...formData, description: v })}
          placeholder="Opcional..."
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={[styles.createButton, loading && styles.createButtonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? t('common.loading') : t('matches.create')}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showCourtPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCourtPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('matches.court')}</Text>
              <TouchableOpacity onPress={() => setShowCourtPicker(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={courts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.courtItem}
                  onPress={() => {
                    setFormData({ ...formData, court: item });
                    setShowCourtPicker(false);
                  }}
                >
                  <View style={styles.courtItemContent}>
                    <Text style={styles.courtItemName}>{item.name}</Text>
                    <Text style={styles.courtItemAddress}>{item.address || 'Badalona'}</Text>
                  </View>
                  <View style={[styles.courtItemType, { backgroundColor: item.access_type === 'lliure' ? '#34C759' : item.access_type === 'restringit' ? '#FF3B30' : '#FF9500' }]}>
                    <Text style={styles.courtItemTypeText}>
                      {item.access_type === 'lliure' ? 'Lliure' : item.access_type === 'restringit' ? 'Restringit' : 'Parcial'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
  },
  form: {
    gap: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  picker: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#8E8E93',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionsWrap: {
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
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#34C759',
  },
  toggleDot: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  toggleDotActive: {
    transform: [{ translateX: 20 }],
  },
  createButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  courtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  courtItemContent: {
    flex: 1,
  },
  courtItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  courtItemAddress: {
    fontSize: 14,
    color: '#8E8E93',
  },
  courtItemType: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  courtItemTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
