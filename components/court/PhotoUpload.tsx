import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../lib/i18n';
import { uploadCourtPhoto, getCourtPhotos, deleteCourtPhoto, pickImage, takePhoto } from '../../lib/storage';

interface Photo {
  id: string;
  photo_url: string;
  storage_path: string;
  user_id: string;
  created_at: string;
}

interface PhotoUploadProps {
  courtId: string;
  isOwner?: boolean;
}

export default function PhotoUpload({ courtId, isOwner = false }: PhotoUploadProps) {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [courtId]);

  const loadPhotos = async () => {
    setLoading(true);
    const data = await getCourtPhotos(courtId);
    setPhotos(data);
    setLoading(false);
  };

  const handleUpload = async (fromCamera: boolean) => {
    const uri = fromCamera ? await takePhoto() : await pickImage();
    if (!uri) return;

    setUploading(true);
    const url = await uploadCourtPhoto(courtId, uri);
    setUploading(false);

    if (url) {
      loadPhotos();
    } else {
      Alert.alert(t('common.error'), t('courtPhotos.uploadError'));
    }
  };

  const handleDelete = (photo: Photo) => {
    Alert.alert(
      t('courtPhotos.deleteTitle'),
      t('courtPhotos.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCourtPhoto(photo.storage_path);
            if (success) {
              setPhotos(prev => prev.filter(p => p.id !== photo.id));
              setSelectedPhoto(null);
            }
          },
        },
      ]
    );
  };

  const renderPhoto = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoThumb}
      onPress={() => setSelectedPhoto(item)}
    >
      <Image source={{ uri: item.photo_url }} style={styles.photoImage} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('courtPhotos.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Alert.alert(
              t('courtPhotos.addPhoto'),
              '',
              [
                { text: t('courtPhotos.camera'), onPress: () => handleUpload(true) },
                { text: t('courtPhotos.gallery'), onPress: () => handleUpload(false) },
                { text: t('common.cancel'), style: 'cancel' },
              ]
            );
          }}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons name="camera" size={20} color="#007AFF" />
          )}
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={48} color="#E5E5EA" />
          <Text style={styles.emptyText}>{t('courtPhotos.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={renderPhoto}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
        />
      )}

      {selectedPhoto && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={{ uri: selectedPhoto.photo_url }} style={styles.fullImage} />
            {isOwner && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(selectedPhoto)}
              >
                <Ionicons name="trash" size={20} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  loading: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  photoList: {
    gap: 8,
  },
  photoThumb: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
