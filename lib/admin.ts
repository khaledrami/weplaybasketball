import { supabase } from './supabase';
import { Court, Profile } from './types';

export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return !!data;
}

export async function getAllCourts(): Promise<Court[]> {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching courts:', error);
    return [];
  }

  return data || [];
}

export async function createCourt(court: Omit<Court, 'id' | 'created_at'>): Promise<Court | null> {
  const { data, error } = await supabase
    .from('courts')
    .insert(court)
    .select()
    .single();

  if (error) {
    console.error('Error creating court:', error);
    return null;
  }

  return data;
}

export async function updateCourt(id: string, updates: Partial<Court>): Promise<boolean> {
  const { error } = await supabase
    .from('courts')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating court:', error);
    return false;
  }

  return true;
}

export async function deleteCourt(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('courts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting court:', error);
    return false;
  }

  return true;
}

export async function getAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}

export async function getStats(): Promise<{
  totalUsers: number;
  totalMatches: number;
  totalCourts: number;
}> {
  const [usersResult, matchesResult, courtsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }),
    supabase.from('courts').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: usersResult.count || 0,
    totalMatches: matchesResult.count || 0,
    totalCourts: courtsResult.count || 0,
  };
}
