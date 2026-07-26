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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '../../../lib/i18n';
import { createMatch } from '../../../lib/matches';
import { fetchCourts } from '../../../lib/courts';
import { Court, SkillLevel } from '../../../lib/types';
import { Ionicons } from '@expo/vector-icons';

const DURATIONS = [30, 45, 60, 90, 120];
const MAX_PLAYERS = [
  { value: 2, label: '1v1' },
  { value: 4, label: '2v2' },
  { value: 6, label: '3v3' },
  { value: 8, label: '4v4' },
  { value: 10, label: '5v5' },
  { value: 12, label: '6v6' },
  { value: 14, label: '7v7' },
  { value: 16, label: '8v8' },
];

export default function CreateMatchScreen() {
  const { t } = useTranslation();
  const LEVELS: { value: SkillLevel | 'any'; label: string }[] = [
    { value: 'any', label: t('matches.level_any') },
    { value: 'muy_principiante', label: t('levels.muy_principiante') },
    { value: 'principiante', label: t('levels.principiante') },
    { value: 'intermedi', label: t('levels.intermedi') },
    { value: 'avancat', label: t('levels.avancat') },
    { value: 'competitiu', label: t('levels.competitiu') },
  ];
  const router = useRouter();
  const params = useLocalSearchParams<{ courtId?: string }>();
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtSearch, setCourtSearch] = useState('');
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

    // Pre-select court from query param (map → create flow)
    if (params.courtId) {
      const match = data.find(c => c.id === params.courtId);
      if (match) {
        setFormData(prev => ({ ...prev, court: match }));
      }
    }
  };

  const filteredCourts = courts.filter((court) => {
    if (!courtSearch) return true;
    const q = courtSearch.toLowerCase();
    return (
      court.name.toLowerCase().includes(q) ||
      court.address?.toLowerCase().includes(q) ||
      court.barrio?.toLowerCase().includes(q)
    );
  });

  const handleCreate = async () => {
    if (!formData.court) {
      Alert.alert(t('common.error'), t('matches.select_court'));
      return;
    }

    if (!formData.date || !formData.time) {
      Alert.alert(t('common.error'), t('matches.select_datetime'));
      return;
    }

    const scheduledAt = new Date(`${formData.date}T${formData.time}:00`);
    if (scheduledAt <= new Date()) {
      Alert.alert(t('common.error'), t('matches.future_datetime'));
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
      Alert.alert(t('common.done'), t('matches.created'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert(t('common.error'), t('matches.create_error'));
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
            {formData.court ? formData.court.name : t('matches.court_placeholder')}
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
        <View style={styles.optionsWrap}>
          {MAX_PLAYERS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.option, formData.maxPlayers === p.value && styles.optionSelected]}
              onPress={() => setFormData({ ...formData, maxPlayers: p.value })}
            >
              <Text style={[styles.optionText, formData.maxPlayers === p.value && styles.optionTextSelected]}>
                {p.value} ({p.label})
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
              {t('matches.language_ca')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, formData.language === 'es' && styles.optionSelected]}
            onPress={() => setFormData({ ...formData, language: 'es' })}
          >
            <Text style={[styles.optionText, formData.language === 'es' && styles.optionTextSelected]}>
              {t('matches.language_es')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, formData.language === 'any' && styles.optionSelected]}
            onPress={() => setFormData({ ...formData, language: 'any' })}
          >
            <Text style={[styles.optionText, formData.language === 'any' && styles.optionTextSelected]}>
              {t('matches.language_any')}
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
          placeholder={t('matches.optional')}
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
            <View style={styles.courtSearchBox}>
              <Ionicons name="search" size={18} color="#8E8E93" />
              <TextInput
                style={styles.courtSearchInput}
                placeholder={t('matches.court_search')}
                value={courtSearch}
                onChangeText={setCourtSearch}
                autoFocus
              />
              {courtSearch !== '' && (
                <TouchableOpacity onPress={() => setCourtSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredCourts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.courtItem, formData.court?.id === item.id && styles.courtItemSelected]}
                  onPress={() => {
                    setFormData({ ...formData, court: item });
                    setShowCourtPicker(false);
                    setCourtSearch('');
                  }}
                >
                  <View style={styles.courtItemContent}>
                    <Text style={styles.courtItemName}>{item.name}</Text>
                    <Text style={styles.courtItemAddress}>{item.address || item.barrio || 'Badalona'}</Text>
                  </View>
                  <View style={[styles.courtItemType, { backgroundColor: item.access_type === 'lliure' ? '#34C759' : item.access_type === 'restringit' ? '#FF3B30' : '#FF9500' }]}>
                    <Text style={styles.courtItemTypeText}>
                      {item.access_type === 'lliure' ? t('map.access_free') : item.access_type === 'restringit' ? t('map.access_restricted') : t('map.access_partial')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: '#8E8E93' }}>{t('matches.no_courts_found')}</Text>
                </View>
              }
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
  courtSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  courtSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  courtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  courtItemSelected: {
    backgroundColor: '#F0F7FF',
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
