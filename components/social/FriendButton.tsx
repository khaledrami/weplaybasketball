import { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../lib/i18n';
import { sendFriendRequest, acceptFriendRequest, removeFriend, getFriendshipStatus } from '../../lib/social';
import { FriendshipStatus } from '../../lib/types';

interface FriendButtonProps {
  userId: string;
  onStatusChange?: () => void;
}

export default function FriendButton({ userId, onStatusChange }: FriendButtonProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<FriendshipStatus | null>(null);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    const result = await getFriendshipStatus(userId);
    setStatus(result?.status ?? null);
    setFriendshipId(result?.friendshipId ?? null);
  };

  const handlePress = async () => {
    setLoading(true);

    if (!status) {
      const success = await sendFriendRequest(userId);
      if (success) {
        await loadStatus();
        onStatusChange?.();
      } else {
        Alert.alert(t('common.error'), t('social.requestError'));
      }
    } else if (status === 'pending' && friendshipId) {
      const success = await acceptFriendRequest(friendshipId);
      if (success) {
        await loadStatus();
        onStatusChange?.();
      }
    } else if (status === 'accepted' && friendshipId) {
      Alert.alert(
        t('social.removeFriendTitle'),
        t('social.removeFriendMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('social.remove'),
            style: 'destructive',
            onPress: async () => {
              const success = await removeFriend(friendshipId);
              if (success) {
                setStatus(null);
                setFriendshipId(null);
                onStatusChange?.();
              }
            },
          },
        ]
      );
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <TouchableOpacity style={styles.button} disabled>
        <ActivityIndicator size="small" color="#E76F51" />
      </TouchableOpacity>
    );
  }

  const getButtonConfig = () => {
    switch (status) {
      case 'accepted':
        return {
          icon: 'checkmark-circle' as const,
          text: t('social.friends'),
          style: styles.friendsButton,
          textStyle: styles.friendsText,
        };
      case 'pending':
        return {
          icon: 'time' as const,
          text: t('social.pending'),
          style: styles.pendingButton,
          textStyle: styles.pendingText,
        };
      default:
        return {
          icon: 'person-add' as const,
          text: t('social.addFriend'),
          style: styles.addButton,
          textStyle: styles.addText,
        };
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity style={[styles.button, config.style]} onPress={handlePress}>
      <Ionicons name={config.icon} size={20} color={config.style === styles.addButton ? '#E76F51' : '#FFFFFF'} />
      <Text style={[styles.buttonText, config.textStyle]}>{config.text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E76F51',
  },
  friendsButton: {
    backgroundColor: '#2D9CDB',
    borderColor: '#2D9CDB',
  },
  pendingButton: {
    backgroundColor: '#F4A261',
    borderColor: '#F4A261',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addText: {
    color: '#E76F51',
  },
  friendsText: {
    color: '#FFFFFF',
  },
  pendingText: {
    color: '#FFFFFF',
  },
});
