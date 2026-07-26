import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../lib/i18n';
import { fetchCourts } from '../../lib/courts';
import { Court } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { COURT_TYPE_KEYS } from '../../lib/constants';
import { PhotoUpload } from '../../components/court/PhotoUpload';

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'lliure' | 'restringit' | 'parcial'>('all');
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

  const handleCourtPress = (court: Court) => {
    setSelectedCourt(court);
    setShowCourtModal(true);
  };

  const filteredCourts = courts.filter((court) => {
    const matchesSearch = !searchQuery ||
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.barrio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || court.access_type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E76F51" />
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={22} color="#6C757D" />
              <TextInput
                style={styles.searchInput}
                placeholder={t('map.search')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>{t('map.filter_all')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'lliure' && styles.filterActiveGreen]}
              onPress={() => setFilter('lliure')}
            >
              <Text style={[styles.filterText, filter === 'lliure' && styles.filterTextActive]}>{t('map.access_free')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'restringit' && styles.filterActiveRed]}
              onPress={() => setFilter('restringit')}
            >
              <Text style={[styles.filterText, filter === 'restringit' && styles.filterTextActive]}>{t('map.access_restricted')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'parcial' && styles.filterActiveYellow]}
              onPress={() => setFilter('parcial')}
            >
              <Text style={[styles.filterText, filter === 'parcial' && styles.filterTextActive]}>{t('map.access_partial')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <WebMapView
              courts={filteredCourts}
              onPress={handleCourtPress}
              t={t}
            />
          </View>

          <FlatList
            data={filteredCourts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CourtListItem court={item} onPress={() => handleCourtPress(item)} t={t} />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={{ fontSize: 56 }}>🏟️</Text>
                <Text style={styles.emptyText}>{t('map.no_courts')}</Text>
                <Text style={[styles.emptyText, { fontSize: 13, color: '#6C757D', marginTop: 4 }]}>
                  {t('map.no_courts_hint')}
                </Text>
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
                        <Ionicons name="close" size={24} color="#6C757D" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.modalAddress}>{selectedCourt.address || selectedCourt.barrio || t('matches.defaultCity')}</Text>
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
                        <Ionicons name="map" size={16} color="#1D3557" />
                        <Text style={styles.mapEmbedLinkText}>{t('map.open_in_map')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.mapEmbedLink}
                        onPress={() => Linking.openURL(`https://www.google.com/maps/@${selectedCourt.lat},${selectedCourt.lng},3a,75y,90t/data=!3m7!1e1!3m5!1sAF1QipMx!2e10!3e11!7i5376!8i2688`)}
                      >
                        <Ionicons name="videocam" size={16} color="#1D3557" />
                        <Text style={styles.mapEmbedLinkText}>{t('map.street_view')}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalInfo}>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="location" size={20} color="#1D3557" />
                        <Text style={styles.modalInfoText}>
                          {selectedCourt.access_type === 'lliure' ? t('map.access_free') :
                           selectedCourt.access_type === 'restringit' ? t('map.access_restricted') :
                           t('map.access_partial')}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="basketball" size={20} color="#1D3557" />
                        <Text style={styles.modalInfoText}>{selectedCourt.hoops || 2} {t('map.hoops')}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="home" size={20} color="#1D3557" />
                        <Text style={styles.modalInfoText}>
                          {t(COURT_TYPE_KEYS[selectedCourt.court_type ?? 'outdoor'] ?? 'map.exterior')}
                        </Text>
                      </View>
                      {selectedCourt.has_lighting !== undefined && (
                        <View style={styles.modalInfoRow}>
                          <Ionicons name="bulb" size={20} color={selectedCourt.has_lighting ? '#2D9CDB' : '#6C757D'} />
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
                        <Ionicons name="time" size={20} color="#F4A261" />
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
                      <Ionicons name="checkmark-circle" size={14} color={selectedCourt.confidence === 'high' ? '#2D9CDB' : '#F4A261'} />
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
        </>
      )}
    </View>
  );
}

function CourtListItem({ court, onPress, t }: { court: Court; onPress: () => void; t: any }) {
  const accessColors: Record<string, string> = {
    lliure: '#2D9CDB',
    restringit: '#E74C3C',
    parcial: '#F4A261',
  };

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={[styles.listDot, { backgroundColor: accessColors[court.access_type] || '#6C757D' }]} />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{court.name}</Text>
        <Text style={styles.listItemAddress}>{court.address || court.barrio || t('matches.defaultCity')}</Text>
        <View style={styles.listItemTags}>
          <Text style={[styles.listItemTag, { backgroundColor: '#EDF2F7', color: '#1D3557' }]}>
            {t(court.access_type === 'lliure' ? 'map.access_free' : court.access_type === 'restringit' ? 'map.access_restricted' : 'map.access_partial')}
          </Text>
          <Text style={[styles.listItemTag, { backgroundColor: '#FEF3E2', color: '#E76F51' }]}>
            {court.hoops || 2} {t('map.hoops')}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6C757D" />
    </TouchableOpacity>
  );
}

function WebMapView({ courts, onPress, t }: { courts: Court[]; onPress: (court: Court) => void; t: any }) {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.centered}>
        <Text style={{ color: '#6C757D', fontSize: 14 }}>{t('map.loading')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1C1C2E',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  filterActive: {
    backgroundColor: '#1D3557',
  },
  filterActiveGreen: {
    backgroundColor: '#2D9CDB',
  },
  filterActiveRed: {
    backgroundColor: '#E74C3C',
  },
  filterActiveYellow: {
    backgroundColor: '#F4A261',
  },
  filterText: {
    fontSize: 12,
    color: '#1C1C2E',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mapContainer: {
    height: 350,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  listDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C2E',
    marginBottom: 3,
  },
  listItemAddress: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 8,
  },
  listItemTags: {
    flexDirection: 'row',
    gap: 8,
  },
  listItemTag: {
    fontSize: 11,
    color: '#1D3557',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 53, 87, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#1D3557',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C2E',
    flex: 1,
  },
  modalAddress: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  modalBarrio: {
    fontSize: 14,
    color: '#E76F51',
    fontWeight: '500',
    marginBottom: 14,
  },
  mapEmbedContainer: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  mapEmbedLinks: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 18,
  },
  mapEmbedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mapEmbedLinkText: {
    fontSize: 13,
    color: '#1D3557',
    fontWeight: '500',
  },
  modalInfo: {
    gap: 14,
    marginBottom: 18,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#1C1C2E',
  },
  modalManager: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
  },
  modalManagerLabel: {
    color: '#6C757D',
    fontSize: 13,
  },
  modalManagerValue: {
    fontWeight: '600',
    color: '#1C1C2E',
  },
  modalSource: {
    marginTop: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSourceLabel: {
    color: '#6C757D',
    fontSize: 12,
  },
  modalSourceValue: {
    fontSize: 12,
    color: '#1C1C2E',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D3557',
    borderRadius: 14,
    padding: 16,
    marginTop: 18,
    gap: 10,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  createMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E76F51',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    gap: 10,
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createMatchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});