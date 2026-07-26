import { supabase } from './supabase';
import { Court } from './types';

export async function fetchCourts(): Promise<Court[]> {
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

export async function fetchCourtById(id: string): Promise<Court | null> {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching court:', error);
    return null;
  }

  return data;
}

export async function fetchCourtsByAccessType(accessType: string): Promise<Court[]> {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('access_type', accessType)
    .order('name');

  if (error) {
    console.error('Error fetching courts by access type:', error);
    return [];
  }

  return data || [];
}

export async function searchCourts(query: string): Promise<Court[]> {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .or(`name.ilike.%${query}%,address.ilike.%${query}%,barrio.ilike.%${query}%`)
    .order('name');

  if (error) {
    console.error('Error searching courts:', error);
    return [];
  }

  return data || [];
}

export function getCourtMarkerColor(accessType: string): string {
  switch (accessType) {
    case 'lliure':
      return '#34C759'; // Green
    case 'restringit':
      return '#FF3B30'; // Red
    case 'parcial':
      return '#FF9500'; // Yellow/Orange
    default:
      return '#8E8E93'; // Gray
  }
}
