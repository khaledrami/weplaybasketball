import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from '../../lib/i18n';
import { fetchCourts, getCourtMarkerColor } from '../../lib/courts';
import { Court } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import CourtMapView from '../../components/CourtMapView';

const COURT_TYPE_LABELS: Record<string, string> = {
  outdoor: 'Exterior',
  indoor: 'Interior',
  covered: 'Cobert',
};

const ACCESS_LABELS: Record<string, string> = {
  lliure: 'map.access_free',
  restringit: 'map.access_restricted',
  parcial: 'map.access_partial',
};

export default function MapScreen() {
  const { t } = useTranslation();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showCourtModal, setShowCourtModal] = useState(false);

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    const data = await fetchCourts();
    setCourts(data);
    setLoading(false);
  };

  const filteredCourts = courts.filter((court) => {
    const matchesSearch = searchQuery === '' ||
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.barrio?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === null || court.access_type === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleCourtPress = (court: Court) => {
    setSelectedCourt(court);
    setShowCourtModal(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const searchBar = (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('map.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filters = (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === null && styles.filterActive]}
        onPress={() => setSelectedFilter(null)}
      >
        <Text style={[styles.filterText, selectedFilter === null && styles.filterTextActive]}>
          Tot ({courts.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'lliure' && styles.filterActiveGreen]}
        onPress={() => setSelectedFilter(selectedFilter === 'lliure' ? null : 'lliure')}
      >
        <Text style={[styles.filterText, selectedFilter === 'lliure' && styles.filterTextActive]}>
          {t('map.access_free')} ({courts.filter(c => c.access_type === 'lliure').length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'restringit' && styles.filterActiveRed]}
        onPress={() => setSelectedFilter(selectedFilter === 'restringit' ? null : 'restringit')}
      >
        <Text style={[styles.filterText, selectedFilter === 'restringit' && styles.filterTextActive]}>
          {t('map.access_restricted')} ({courts.filter(c => c.access_type === 'restringit').length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'parcial' && styles.filterActiveYellow]}
        onPress={() => setSelectedFilter(selectedFilter === 'parcial' ? null : 'parcial')}
      >
        <Text style={[styles.filterText, selectedFilter === 'parcial' && styles.filterTextActive]}>
          {t('map.access_partial')} ({courts.filter(c => c.access_type === 'parcial').length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const courtModal = (
    <Modal
      visible={showCourtModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCourtModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedCourt && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedCourt.name}</Text>
                <TouchableOpacity onPress={() => setShowCourtModal(false)}>
                  <Ionicons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalAddress}>{selectedCourt.address}</Text>
              {selectedCourt.barrio && (
                <Text style={styles.modalBarrio}>{selectedCourt.barrio}</Text>
              )}

              <View style={styles.modalInfo}>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="location" size={20} color="#007AFF" />
                  <Text style={styles.modalInfoText}>
                    {selectedCourt.access_type === 'lliure' ? t('map.access_free') :
                     selectedCourt.access_type === 'restringit' ? t('map.access_restricted') :
                     t('map.access_partial')}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="basketball" size={20} color="#007AFF" />
                  <Text style={styles.modalInfoText}>{selectedCourt.hoops} cistelles</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="home" size={20} color="#007AFF" />
                  <Text style={styles.modalInfoText}>
                    {selectedCourt.court_type === 'outdoor' ? 'Exterior' :
                     selectedCourt.court_type === 'indoor' ? 'Interior' : 'Cobert'}
                  </Text>
                </View>
                {selectedCourt.has_lighting !== undefined && (
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="bulb" size={20} color={selectedCourt.has_lighting ? '#34C759' : '#8E8E93'} />
                    <Text style={styles.modalInfoText}>
                      {selectedCourt.has_lighting ? 'Il·luminada' : 'Sense il·luminació'}
                    </Text>
                  </View>
                )}
              </View>

              {selectedCourt.manager && (
                <View style={styles.modalManager}>
                  <Text style={styles.modalManagerLabel}>Gestor:</Text>
                  <Text style={styles.modalManagerValue}>{selectedCourt.manager}</Text>
                </View>
              )}

              {selectedCourt.phone && (
                <View style={styles.modalManager}>
                  <Text style={styles.modalManagerLabel}>Telèfon:</Text>
                  <Text style={styles.modalManagerValue}>{selectedCourt.phone}</Text>
                </View>
              )}

              <View style={styles.modalSource}>
                <Text style={styles.modalSourceLabel}>Font:</Text>
                <Text style={styles.modalSourceValue}>{selectedCourt.source}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <CourtMapView
      filteredCourts={filteredCourts}
      onCourtPress={handleCourtPress}
      searchBar={searchBar}
      filters={filters}
      courtModal={courtModal}
      t={t}
    />
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  filterActive: { backgroundColor: '#007AFF' },
  filterActiveGreen: { backgroundColor: '#34C759' },
  filterActiveRed: { backgroundColor: '#FF3B30' },
  filterActiveYellow: { backgroundColor: '#FF9500' },
  filterText: { fontSize: 12, color: '#000000' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  modalAddress: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  modalBarrio: { fontSize: 14, color: '#007AFF', marginBottom: 16 },
  modalInfo: { gap: 12, marginBottom: 16 },
  modalInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalInfoText: { fontSize: 14 },
  modalManager: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  modalManagerLabel: { color: '#8E8E93' },
  modalManagerValue: { fontWeight: '500' },
  modalSource: { marginTop: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#E5E5EA' },
  modalSourceLabel: { color: '#8E8E93', fontSize: 12 },
  modalSourceValue: { fontSize: 12, color: '#000000' },
});
