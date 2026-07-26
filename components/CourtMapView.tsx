import { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getCourtMarkerColor } from '../lib/courts';
import { Court } from '../lib/types';

const BADALONA_REGION = {
  latitude: 41.4418,
  longitude: 2.2310,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const ACCESS_LABELS: Record<string, string> = {
  lliure: 'map.access_free',
  restringit: 'map.access_restricted',
  parcial: 'map.access_partial',
};

export default function CourtMapView({
  filteredCourts,
  onCourtPress,
  searchBar,
  filters,
  courtModal,
  t,
}: {
  filteredCourts: Court[];
  onCourtPress: (court: Court) => void;
  searchBar: React.ReactNode;
  filters: React.ReactNode;
  courtModal: React.ReactNode;
  t: (key: string) => string;
}) {
  const mapRef = useRef<MapView>(null);

  return (
    <View style={styles.container}>
      {searchBar}
      {filters}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={BADALONA_REGION}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredCourts.map((court) => (
          <Marker
            key={court.id}
            coordinate={{ latitude: court.lat, longitude: court.lng }}
            pinColor={getCourtMarkerColor(court.access_type)}
          >
            <Callout onPress={() => onCourtPress(court)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{court.name}</Text>
                <Text style={styles.calloutAddress}>{court.address}</Text>
                <Text style={styles.calloutType}>
                  {t(ACCESS_LABELS[court.access_type] ?? 'map.access_free')}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>{t('map.access_free')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>{t('map.access_restricted')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
          <Text style={styles.legendText}>{t('map.access_partial')}</Text>
        </View>
      </View>
      {courtModal}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  calloutType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#8E8E93',
  },
});
