import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, FlatList, Modal, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../lib/i18n';
import { fetchCourts, getCourtMarkerColor } from '../../lib/courts';
import { Court } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import WebMapView from '../../components/WebMapView';
import PhotoUpload from '../../components/court/PhotoUpload';

const COURT_TYPE_KEYS: Record<string, string> = {
  outdoor: 'map.exterior',
  indoor: 'map.interior',
  covered: 'map.covered',
};

const ACCESS_LABELS: Record<string, string> = {
  lliure: 'map.access_free',
  restringit: 'map.access_restricted',
  parcial: 'map.access_partial',
};

function CourtListItem({ court, onPress, t }: { court: Court; onPress: () => void; t: (key: string) => string }) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={[styles.listDot, { backgroundColor: getCourtMarkerColor(court.access_type) }]} />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{court.name}</Text>
        <Text style={styles.listItemAddress}>{court.address || court.barrio || 'Badalona'}{court.barrio && court.address ? ` · ${court.barrio}` : ''}</Text>
        <View style={styles.listItemTags}>
          <Text style={styles.listItemTag}>{t(ACCESS_LABELS[court.access_type] ?? 'map.access_free')}</Text>
          <Text style={styles.listItemTag}>{court.hoops || 2} {t('map.hoops')}</Text>
          <Text style={styles.listItemTag}>{t(COURT_TYPE_KEYS[court.court_type ?? 'outdoor'] ?? court.court_type)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>('lliure');
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
      court.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  return (
    <View style={styles.container}>
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

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === null && styles.filterActive]}
          onPress={() => setSelectedFilter(null)}
        >
          <Text style={[styles.filterText, selectedFilter === null && styles.filterTextActive]}>
            {t('map.all')} ({courts.length})
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

      <View style={styles.mapContainer}>
        <WebMapView courts={filteredCourts} onCourtPress={handleCourtPress} />
      </View>

      <FlatList
        data={filteredCourts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CourtListItem court={item} onPress={() => handleCourtPress(item)} t={t} />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('map.no_courts')}</Text>
          </View>
        }
      />

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

                <Text style={styles.modalAddress}>{selectedCourt.address || selectedCourt.barrio || 'Badalona'}</Text>
                {selectedCourt.barrio && (
                  <Text style={styles.modalBarrio}>{selectedCourt.barrio}</Text>
                )}

                <View style={styles.mapEmbedContainer}>
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCourt.lng - 0.005},${selectedCourt.lat - 0.003},${selectedCourt.lng + 0.005},${selectedCourt.lat + 0.003}&layer=mapnik&marker=${selectedCourt.lat},${selectedCourt.lng}`}
                    style={{ width: '100%', height: 200, border: 'none', borderRadius: 12 }}
                    loading="lazy"
                    title={`Mapa de ${selectedCourt.name}`}
                  />
                </View>

                <View style={styles.mapEmbedLinks}>
                  <TouchableOpacity
                    style={styles.mapEmbedLink}
                    onPress={() => Linking.openURL(`https://www.openstreetmap.org/?mlat=${selectedCourt.lat}&mlon=${selectedCourt.lng}#map=17/${selectedCourt.lat}/${selectedCourt.lng}`)}
                  >
                    <Ionicons name="map" size={16} color="#007AFF" />
                    <Text style={styles.mapEmbedLinkText}>{t('map.open_in_map')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mapEmbedLink}
                    onPress={() => Linking.openURL(`https://www.google.com/maps/@${selectedCourt.lat},${selectedCourt.lng},3a,75y,90t/data=!3m7!1e1!3m5!1sAF1QipMx!2e10!3e11!7i5376!8i2688`)}
                  >
                    <Ionicons name="videocam" size={16} color="#007AFF" />
                    <Text style={styles.mapEmbedLinkText}>{t('map.street_view')}</Text>
                  </TouchableOpacity>
                </View>

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
                    <Text style={styles.modalInfoText}>{selectedCourt.hoops || 2} {t('map.hoops')}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="home" size={20} color="#007AFF" />
                    <Text style={styles.modalInfoText}>
                      {t(COURT_TYPE_KEYS[selectedCourt.court_type ?? 'outdoor'] ?? 'map.exterior')}
                    </Text>
                  </View>
                  {selectedCourt.has_lighting !== undefined && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="bulb" size={20} color={selectedCourt.has_lighting ? '#34C759' : '#8E8E93'} />
                      <Text style={styles.modalInfoText}>
                        {selectedCourt.has_lighting ? t('map.lit') : t('map.no_lighting')}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedCourt.manager && (
                  <View style={styles.modalManager}>
                    <Text style={styles.modalManagerLabel}>{t('map.manager')}</Text>
                    <Text style={styles.modalManagerValue}>{selectedCourt.manager}</Text>
                  </View>
                )}

                {selectedCourt.phone && (
                  <View style={styles.modalManager}>
                    <Text style={styles.modalManagerLabel}>{t('map.phone')}</Text>
                    <Text style={styles.modalManagerValue}>{selectedCourt.phone}</Text>
                  </View>
                )}

                {selectedCourt.opening_hours && (
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="time" size={20} color="#FF9500" />
                    <Text style={styles.modalInfoText}>{selectedCourt.opening_hours}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => {
                    const url = Platform.select({
                      web: `https://www.google.com/maps/dir/?api=1&destination=${selectedCourt.lat},${selectedCourt.lng}`,
                      default: `https://www.google.com/maps/dir/?api=1&destination=${selectedCourt.lat},${selectedCourt.lng}`,
                    });
                    Linking.openURL(url);
                  }}
                >
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  <Text style={styles.directionsButtonText}>{t('map.directions')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.createMatchButton}
                  onPress={() => {
                    setShowCourtModal(false);
                    router.push(`/(tabs)/matches/create?courtId=${selectedCourt.id}`);
                  }}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createMatchButtonText}>{t('map.create_match')}</Text>
                </TouchableOpacity>

                <View style={styles.modalSource}>
                  <Ionicons name="checkmark-circle" size={14} color={selectedCourt.confidence === 'high' ? '#34C759' : '#FF9500'} />
                  <Text style={styles.modalSourceLabel}>
                    {selectedCourt.confidence === 'high' ? t('map.verified_data') : t('map.approx_data')}
                  </Text>
                  <Text style={styles.modalSourceValue}>
                    {' · '}
                    {selectedCourt.source.includes('merged') ? 'Diputació + OSM' :
                     selectedCourt.source === 'diba' ? 'Diputació de Barcelona' :
                     selectedCourt.source === 'ajuntament' ? 'Ajuntament de Badalona' :
                     selectedCourt.source === 'osm' ? 'OpenStreetMap' :
                     selectedCourt.source}
                  </Text>
                </View>

                <PhotoUpload courtId={selectedCourt.id} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  filterRow: {
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
  filterActive: {
    backgroundColor: '#007AFF',
  },
  filterActiveGreen: {
    backgroundColor: '#34C759',
  },
  filterActiveRed: {
    backgroundColor: '#FF3B30',
  },
  filterActiveYellow: {
    backgroundColor: '#FF9500',
  },
  filterText: {
    fontSize: 12,
    color: '#000000',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mapContainer: {
    height: 350,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  listDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  listItemAddress: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 6,
  },
  listItemTags: {
    flexDirection: 'row',
    gap: 8,
  },
  listItemTag: {
    fontSize: 11,
    color: '#007AFF',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 40,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalAddress: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  modalBarrio: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12,
  },
  mapEmbedContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapEmbedLinks: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  mapEmbedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapEmbedLinkText: {
    fontSize: 13,
    color: '#007AFF',
  },
  modalInfo: {
    gap: 12,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalInfoText: {
    fontSize: 14,
  },
  modalManager: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  modalManagerLabel: {
    color: '#8E8E93',
  },
  modalManagerValue: {
    fontWeight: '500',
  },
  modalSource: {
    marginTop: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSourceLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  modalSourceValue: {
    fontSize: 12,
    color: '#000000',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    gap: 8,
  },
  createMatchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
