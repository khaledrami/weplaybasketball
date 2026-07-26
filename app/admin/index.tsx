import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../lib/i18n';
import { isAdmin, getStats, getAllCourts, deleteCourt } from '../../lib/admin';
import { Court } from '../../lib/types';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalMatches: 0, totalCourts: 0 });
  const [courts, setCourts] = useState<Court[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const admin = await isAdmin();
    setIsUserAdmin(admin);
    if (admin) {
      await loadData();
    }
    setLoading(false);
  };

  const loadData = async () => {
    const [statsData, courtsData] = await Promise.all([
      getStats(),
      getAllCourts(),
    ]);
    setStats(statsData);
    setCourts(courtsData);
  };

  const handleDeleteCourt = (court: Court) => {
    Alert.alert(
      t('admin.deleteCourt'),
      t('admin.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCourt(court.id);
            if (success) {
              setCourts(prev => prev.filter(c => c.id !== court.id));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isUserAdmin) {
    return (
      <View style={styles.unauthorized}>
        <Ionicons name="lock-closed" size={48} color="#E5E5EA" />
        <Text style={styles.unauthorizedText}>{t('admin.unauthorized')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('admin.title')}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#007AFF" />
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>{t('admin.userCount', { count: stats.totalUsers })}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="basketball" size={24} color="#34C759" />
          <Text style={styles.statValue}>{stats.totalMatches}</Text>
          <Text style={styles.statLabel}>{t('admin.matchCount', { count: stats.totalMatches })}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="location" size={24} color="#FF9500" />
          <Text style={styles.statValue}>{stats.totalCourts}</Text>
          <Text style={styles.statLabel}>{t('admin.courtCount', { count: stats.totalCourts })}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('admin.courts')}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {courts.map((court) => (
          <View key={court.id} style={styles.courtItem}>
            <View style={styles.courtInfo}>
              <Text style={styles.courtName}>{court.name}</Text>
              <Text style={styles.courtAddress}>{court.address || 'Badalona'}</Text>
            </View>
            <View style={styles.courtActions}>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCourt(court)}
              >
                <Ionicons name="trash" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorized: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  courtAddress: {
    fontSize: 14,
    color: '#8E8E93',
  },
  courtActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
