import { supabase } from './supabase';
import { Match, MatchPlayer, Court, Profile } from './types';

export async function createMatch(matchData: {
  court_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  max_players?: number;
  level_required?: string;
  language?: string;
  is_mixed?: boolean;
  description?: string;
}): Promise<Match | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      creator_id: user.id,
      court_id: matchData.court_id,
      scheduled_at: matchData.scheduled_at,
      duration_minutes: matchData.duration_minutes || 60,
      max_players: matchData.max_players || 10,
      current_players: 1,
      level_required: matchData.level_required && matchData.level_required !== 'any' ? matchData.level_required : null,
      language: matchData.language || 'ca',
      is_mixed: matchData.is_mixed ?? true,
      description: matchData.description,
      status: 'open',
    })
    .select()
    .single();

  if (matchError) {
    console.error('Error creating match:', matchError);
    return null;
  }

  // Add creator as first player
  const { error: playerError } = await supabase
    .from('match_players')
    .insert({
      match_id: match.id,
      user_id: user.id,
      team: null,
      role: 'player',
    });

  if (playerError) {
    console.error('Error adding player:', playerError);
  }

  return match;
}

export async function fetchUpcomingMatches(): Promise<(Match & { court: Court })[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      court:courts(*)
    `)
    .gte('scheduled_at', new Date().toISOString())
    .in('status', ['open', 'full'])
    .order('scheduled_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

export async function fetchMatchById(id: string): Promise<(Match & { court: Court; players: (MatchPlayer & { profile: Profile })[] }) | null> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      court:courts(*),
      players:match_players(
        *,
        profile:profiles(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching match:', error);
    return null;
  }

  return data;
}

export async function joinMatch(matchId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if match is full
  const { data: match } = await supabase
    .from('matches')
    .select('max_players, current_players')
    .eq('id', matchId)
    .single();

  if (!match) return false;

  const isFull = match.current_players >= match.max_players;

  const { error } = await supabase
    .from('match_players')
    .insert({
      match_id: matchId,
      user_id: user.id,
      team: null,
      role: isFull ? 'waitlist' : 'player',
    });

  if (error) {
    console.error('Error joining match:', error);
    return false;
  }

  // Update current_players count
  if (!isFull) {
    await supabase
      .from('matches')
      .update({ current_players: match.current_players + 1 })
      .eq('id', matchId);
  }

  return true;
}

export async function leaveMatch(matchId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('match_players')
    .delete()
    .eq('match_id', matchId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error leaving match:', error);
    return false;
  }

  // Update current_players count
  const { data: match } = await supabase
    .from('matches')
    .select('current_players')
    .eq('id', matchId)
    .single();

  if (match && match.current_players > 0) {
    await supabase
      .from('matches')
      .update({ current_players: match.current_players - 1 })
      .eq('id', matchId);
  }

  return true;
}

export async function cancelMatch(matchId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('matches')
    .update({ status: 'cancelled' })
    .eq('id', matchId)
    .eq('creator_id', user.id);

  if (error) {
    console.error('Error cancelling match:', error);
    return false;
  }

  return true;
}
