import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../lib/i18n';
import { useAuth } from '../../lib/auth';
import {
  getFriendships,
  getPendingRequests,
  searchPlayers,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../../lib/social';
import { Profile, Friendship } from '../../lib/types';
import FriendButton from '../../components/social/FriendButton';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'friends' | 'pending' | 'search';

export default function SocialScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<(Friendship & { friend: Profile })[]>([]);
  const [pending, setPending] = useState<(Friendship & { requester: Profile })[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [friendsData, pendingData] = await Promise.all([
      getFriendships(),
      getPendingRequests(),
    ]);
    setFriends(friendsData);
    setPending(pendingData);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    const results = await searchPlayers(searchQuery.trim());
    setSearchResults(results);
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    const success = await acceptFriendRequest(friendshipId);
    if (success) {
      loadData();
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    const success = await rejectFriendRequest(friendshipId);
    if (success) {
      loadData();
    }
  };

  const renderFriend = ({ item }: { item: Friendship & { friend: Profile } }) => (
    <View style={styles.playerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.friend.display_name?.charAt(0) || '?'}
        </Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.friend.display_name}</Text>
        <Text style={styles.playerLevel}>{item.friend.level}</Text>
      </View>
      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => Alert.alert(t('common.info'), t('social.chatComingSoon'))}
      >
        <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderPendingRequest = ({ item }: { item: Friendship & { requester: Profile } }) => (
    <View style={styles.playerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.requester.display_name?.charAt(0) || '?'}
        </Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.requester.display_name}</Text>
        <Text style={styles.playerLevel}>{item.requester.level}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectRequest(item.id)}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResult = ({ item }: { item: Profile }) => (
    <View style={styles.playerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.display_name?.charAt(0) || '?'}
        </Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.display_name}</Text>
        <Text style={styles.playerLevel}>{item.level}</Text>
      </View>
      <FriendButton userId={item.id} onStatusChange={loadData} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.social')}</Text>
      </View>

      <View style={styles.tabs}>
        {(['friends', 'pending', 'search'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {t(`social.tab_${tab}`)}
            </Text>
            {tab === 'pending' && pending.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pending.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchField}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholder={t('social.searchPlaceholder')}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {activeTab === 'friends' && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#E5E5EA" />
              <Text style={styles.emptyText}>{t('social.noFriends')}</Text>
            </View>
          }
        />
      )}

      {activeTab === 'pending' && (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          renderItem={renderPendingRequest}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={48} color="#E5E5EA" />
              <Text style={styles.emptyText}>{t('social.noPending')}</Text>
            </View>
          }
        />
      )}

      {activeTab === 'search' && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color="#E5E5EA" />
              <Text style={styles.emptyText}>{t('social.noResults')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchField: {
    flex: 1,
    fontSize: 16,
  },
  list: {
    padding: 24,
    gap: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  playerLevel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});
