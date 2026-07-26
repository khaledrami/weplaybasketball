import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../lib/i18n';
import { useTheme } from '../../lib/theme';
import { fetchCourts } from '../../lib/courts';
import { Court } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { COURT_TYPE_KEYS } from '../../lib/constants';
import PhotoUpload from '../../components/court/PhotoUpload';
import WebMapView from '../../components/WebMapView';
import { HeroIllustration } from '../../components/ui/Illustrations';

export default function MapScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, typography, shadows, courtAccessColors } = useTheme();
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

  const getAccessLabel = (type: string) => {
    if (type === 'lliure') return t('map.access_free');
    if (type === 'restringit') return t('map.access_restricted');
    return t('map.access_partial');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceElevated }]}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={true}
          >
            {/* Hero banner */}
            <View style={styles.heroBanner}>
              <View style={[styles.heroImage, { backgroundColor: '#4DB8E8', overflow: 'hidden' }]}>
                <HeroIllustration size={300} />
                <View style={[styles.heroOverlay, { backgroundColor: colors.overlayStrong }]}>
                  <View style={styles.heroContent}>
                    <Text style={[styles.heroTitle, { color: colors.textOnPrimary }]}>{t('app_name')}</Text>
                    <Text style={[styles.heroSubtitle, { color: colors.textOnPrimary }]}>{t('map.hero_subtitle')}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <View style={[styles.searchBox, { backgroundColor: colors.surface, ...shadows.level2 }]}>
                <Ionicons name="search" size={22} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  placeholder={t('map.search')}
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.surface, ...shadows.level1 },
                  filter === 'all' && { backgroundColor: colors.primary },
                ]}
                onPress={() => setFilter('all')}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.textPrimary },
                    filter === 'all' && { color: colors.textOnPrimary },
                  ]}
                >
                  {t('map.filter_all')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.surface, ...shadows.level1 },
                  filter === 'lliure' && { backgroundColor: colors.success },
                ]}
                onPress={() => setFilter('lliure')}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.textPrimary },
                    filter === 'lliure' && { color: colors.textOnPrimary },
                  ]}
                >
                  {t('map.access_free')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.surface, ...shadows.level1 },
                  filter === 'restringit' && { backgroundColor: colors.danger },
                ]}
                onPress={() => setFilter('restringit')}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.textPrimary },
                    filter === 'restringit' && { color: colors.textOnPrimary },
                  ]}
                >
                  {t('map.access_restricted')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.surface, ...shadows.level1 },
                  filter === 'parcial' && { backgroundColor: colors.warning },
                ]}
                onPress={() => setFilter('parcial')}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: colors.textPrimary },
                    filter === 'parcial' && { color: colors.textOnPrimary },
                  ]}
                >
                  {t('map.access_partial')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.mapContainer, { borderRadius: borderRadius.xl }]}>
              <WebMapView
                courts={filteredCourts}
                onCourtPress={handleCourtPress}
              />
            </View>

            {/* Courts list - rendered directly inside ScrollView */}
            <View style={styles.listContent}>
              {filteredCourts.length === 0 ? (
                <View style={styles.centered}>
                  <Text style={{ fontSize: 56 }}>🏟️</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('map.no_courts')}</Text>
                  <Text style={[styles.emptyText, { fontSize: 13, color: colors.textMuted, marginTop: 4 }]}>
                    {t('map.no_courts_hint')}
                  </Text>
                </View>
              ) : (
                filteredCourts.map((court) => (
                  <CourtListItem
                    key={court.id}
                    court={court}
                    onPress={() => handleCourtPress(court)}
                    t={t}
                    colors={colors}
                    courtAccessColors={courtAccessColors}
                    borderRadius={borderRadius}
                    spacing={spacing}
                    shadows={shadows}
                    typography={typography}
                  />
                ))
              )}
            </View>
          </ScrollView>

          <Modal
            visible={showCourtModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCourtModal(false)}
          >
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xxl, borderTopRightRadius: borderRadius.xxl, ...shadows.level4 }]}>
                {selectedCourt && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{selectedCourt.name}</Text>
                      <TouchableOpacity onPress={() => setShowCourtModal(false)}>
                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.modalAddress, { color: colors.textSecondary }]}>{selectedCourt.address || selectedCourt.barrio || t('matches.defaultCity')}</Text>
                    {selectedCourt.barrio && (
                      <Text style={[styles.modalBarrio, { color: colors.secondary }]}>{selectedCourt.barrio}</Text>
                    )}

                    <View style={[styles.mapEmbedContainer, { borderRadius: borderRadius.xl }]}>
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCourt.lng - 0.005},${selectedCourt.lat - 0.003},${selectedCourt.lng + 0.005},${selectedCourt.lat + 0.003}&layer=mapnik&marker=${selectedCourt.lat},${selectedCourt.lng}`}
                        style={{ width: '100%', height: 200, border: 'none', borderRadius: borderRadius.xl }}
                        loading="lazy"
                        title={`Mapa de ${selectedCourt.name}`}
                      />
                    </View>

                    <View style={styles.mapEmbedLinks}>
                      <TouchableOpacity
                        style={styles.mapEmbedLink}
                        onPress={() => Linking.openURL(`https://www.openstreetmap.org/?mlat=${selectedCourt.lat}&mlon=${selectedCourt.lng}#map=17/${selectedCourt.lat}/${selectedCourt.lng}`)}
                      >
                        <Ionicons name="map" size={16} color={colors.primary} />
                        <Text style={[styles.mapEmbedLinkText, { color: colors.primary }]}>{t('map.open_in_map')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.mapEmbedLink}
                        onPress={() => Linking.openURL(`https://www.google.com/maps/@${selectedCourt.lat},${selectedCourt.lng},3a,75y,90t/data=!3m7!1e1!3m5!1sAF1QipMx!2e10!3e11!7i5376!8i2688`)}
                      >
                        <Ionicons name="videocam" size={16} color={colors.primary} />
                        <Text style={[styles.mapEmbedLinkText, { color: colors.primary }]}>{t('map.street_view')}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={[styles.modalInfo, { gap: spacing[3] }]}>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="location" size={20} color={colors.primary} />
                        <Text style={[styles.modalInfoText, { color: colors.textPrimary }]}>
                          {getAccessLabel(selectedCourt.access_type)}
                        </Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="basketball" size={20} color={colors.primary} />
                        <Text style={[styles.modalInfoText, { color: colors.textPrimary }]}>{selectedCourt.hoops || 2} {t('map.hoops')}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="home" size={20} color={colors.primary} />
                        <Text style={[styles.modalInfoText, { color: colors.textPrimary }]}>
                          {t(COURT_TYPE_KEYS[selectedCourt.court_type ?? 'outdoor'] ?? 'map.exterior')}
                        </Text>
                      </View>
                      {selectedCourt.has_lighting !== undefined && (
                        <View style={styles.modalInfoRow}>
                          <Ionicons name="bulb" size={20} color={selectedCourt.has_lighting ? colors.tertiary : colors.textMuted} />
                          <Text style={[styles.modalInfoText, { color: colors.textPrimary }]}>
                            {selectedCourt.has_lighting ? t('map.lit') : t('map.no_lighting')}
                          </Text>
                        </View>
                      )}
                    </View>

                    {selectedCourt.manager && (
                      <View style={[styles.modalManager, { borderTopColor: colors.border }]}>
                        <Text style={[styles.modalManagerLabel, { color: colors.textSecondary }]}>{t('map.manager')}</Text>
                        <Text style={[styles.modalManagerValue, { color: colors.textPrimary }]}>{selectedCourt.manager}</Text>
                      </View>
                    )}

                    {selectedCourt.phone && (
                      <View style={[styles.modalManager, { borderTopColor: colors.border }]}>
                        <Text style={[styles.modalManagerLabel, { color: colors.textSecondary }]}>{t('map.phone')}</Text>
                        <Text style={[styles.modalManagerValue, { color: colors.textPrimary }]}>{selectedCourt.phone}</Text>
                      </View>
                    )}

                    {selectedCourt.opening_hours && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="time" size={20} color={colors.warning} />
                        <Text style={[styles.modalInfoText, { color: colors.textPrimary }]}>{selectedCourt.opening_hours}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[styles.directionsButton, { backgroundColor: colors.primary, borderRadius: borderRadius.xl, ...shadows.level3 }]}
                      onPress={() => {
                        const url = Platform.select({
                          web: `https://www.google.com/maps/dir/?api=1&destination=${selectedCourt.lat},${selectedCourt.lng}`,
                          default: `https://www.google.com/maps/dir/?api=1&destination=${selectedCourt.lat},${selectedCourt.lng}`,
                        });
                        Linking.openURL(url);
                      }}
                    >
                      <Ionicons name="navigate" size={20} color={colors.textOnPrimary} />
                      <Text style={[styles.directionsButtonText, { color: colors.textOnPrimary }]}>{t('map.directions')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.createMatchButton, { backgroundColor: colors.secondary, borderRadius: borderRadius.xl, ...shadows.level3 }]}
                      onPress={() => {
                        setShowCourtModal(false);
                        router.push(`/(tabs)/matches/create?courtId=${selectedCourt.id}`);
                      }}
                    >
                      <Ionicons name="add-circle" size={20} color={colors.textOnSecondary} />
                      <Text style={[styles.createMatchButtonText, { color: colors.textOnSecondary }]}>{t('map.create_match')}</Text>
                    </TouchableOpacity>

                    <View style={[styles.modalSource, { borderTopColor: colors.border }]}>
                      <Ionicons name="checkmark-circle" size={14} color={selectedCourt.confidence === 'high' ? colors.tertiary : colors.warning} />
                      <Text style={[styles.modalSourceLabel, { color: colors.textSecondary }]}>
                        {selectedCourt.confidence === 'high' ? t('map.verified_data') : t('map.approx_data')}
                      </Text>
                      <Text style={[styles.modalSourceValue, { color: colors.textSecondary }]}>
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

function CourtListItem({
  court,
  onPress,
  t,
  colors,
  courtAccessColors,
  borderRadius,
  spacing,
  shadows,
  typography,
}: {
  court: Court;
  onPress: () => void;
  t: any;
  colors: any;
  courtAccessColors: any;
  borderRadius: any;
  spacing: any;
  shadows: any;
  typography: any;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.listItem,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing[4],
          marginBottom: spacing[3],
          ...shadows.level2,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.listDot,
          {
            backgroundColor: courtAccessColors[court.access_type] || colors.textMuted,
            width: spacing[3],
            height: spacing[3],
            borderRadius: spacing[3] / 2,
            marginRight: spacing[4],
          },
        ]}
      />
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemTitle, { color: colors.textPrimary, fontSize: typography.fontSizes.bodyLarge, fontWeight: typography.fontWeights.semiBold, marginBottom: spacing[1] }]}>
          {court.name}
        </Text>
        <Text style={[styles.listItemAddress, { color: colors.textSecondary, fontSize: typography.fontSizes.bodySmall, marginBottom: spacing[2] }]}>
          {court.address || court.barrio || t('matches.defaultCity')}
        </Text>
        <View style={[styles.listItemTags, { gap: spacing[2] }]}>
          <Text
            style={[
              styles.listItemTag,
              {
                backgroundColor: colors.surfaceHover,
                color: colors.textPrimary,
                fontSize: typography.fontSizes.labelMedium,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[1],
                borderRadius: borderRadius.md,
              },
            ]}
          >
            {t(court.access_type === 'lliure' ? 'map.access_free' : court.access_type === 'restringit' ? 'map.access_restricted' : 'map.access_partial')}
          </Text>
          <Text
            style={[
              styles.listItemTag,
              {
                backgroundColor: colors.surfaceHover,
                color: colors.secondary,
                fontSize: typography.fontSizes.labelMedium,
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[1],
                borderRadius: borderRadius.md,
              },
            ]}
          >
            {court.hoops || 2} {t('map.hoops')}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
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
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
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
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  mapContainer: {
    height: 350,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDot: {
    borderRadius: 6,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {},
  listItemAddress: {},
  listItemTags: {
    flexDirection: 'row',
  },
  listItemTag: {
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    maxHeight: '80%',
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
    flex: 1,
  },
  modalAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalBarrio: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
  },
  mapEmbedContainer: {
    marginBottom: 10,
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
    fontWeight: '500',
  },
  modalInfo: {
    marginBottom: 18,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalInfoText: {
    fontSize: 14,
  },
  modalManager: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  modalManagerLabel: {
    fontSize: 13,
  },
  modalManagerValue: {
    fontWeight: '600',
  },
  modalSource: {
    marginTop: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSourceLabel: {
    fontSize: 12,
  },
  modalSourceValue: {
    fontSize: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 18,
    gap: 10,
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  createMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 10,
    gap: 10,
  },
  createMatchButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroBanner: {
    height: 220,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 400,
  },
});
