import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';

const BUCKET_NAME = 'court-photos';

export async function uploadCourtPhoto(courtId: string, imageUri: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileExt = imageUri.split('.').pop() || 'jpg';
  const fileName = `${courtId}/${Date.now()}.${fileExt}`;

  // Read file as blob
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType: `image/${fileExt}`,
      upsert: false,
    });

  if (error) {
    console.error('Error uploading photo:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  // Save reference in database
  const { error: dbError } = await supabase
    .from('court_photos')
    .insert({
      court_id: courtId,
      user_id: user.id,
      photo_url: urlData.publicUrl,
      storage_path: data.path,
    });

  if (dbError) {
    console.error('Error saving photo reference:', dbError);
  }

  return urlData.publicUrl;
}

export async function deleteCourtPhoto(storagePath: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    console.error('Error deleting photo:', error);
    return false;
  }

  return true;
}

export async function getCourtPhotos(courtId: string): Promise<{ id: string; photo_url: string; user_id: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from('court_photos')
    .select('*')
    .eq('court_id', courtId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }

  return data || [];
}

export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}
