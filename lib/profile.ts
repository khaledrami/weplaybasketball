import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Profile } from './types';

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  const fetchProfile = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return false;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    await fetchProfile(userId);
    return true;
  };

  const createProfile = async (newProfile: Partial<Profile>) => {
    if (!userId) return false;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .insert({ id: userId, ...newProfile });

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }

    await fetchProfile(userId);
    return true;
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refreshProfile: () => userId && fetchProfile(userId),
  };
}
