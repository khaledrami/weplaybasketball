import { supabase } from './supabase';
import { Rating, Profile, SkillLevel } from './types';

export interface RatingInput {
  rated_id: string;
  punctuality: number;
  sportsmanship: number;
  actual_level: number;
}

export async function submitRatings(matchId: string, ratings: RatingInput[]): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const ratingRecords = ratings.map((r) => ({
    match_id: matchId,
    rater_id: user.id,
    rated_id: r.rated_id,
    punctuality: r.punctuality,
    sportsmanship: r.sportsmanship,
    actual_level: r.actual_level,
  }));

  const { error } = await supabase
    .from('ratings')
    .insert(ratingRecords);

  if (error) {
    console.error('Error submitting ratings:', error);
    return false;
  }

  // Update player's average rating
  for (const r of ratings) {
    await updatePlayerRating(r.rated_id);
  }

  return true;
}

async function updatePlayerRating(userId: string): Promise<void> {
  const { data: ratings } = await supabase
    .from('ratings')
    .select('punctuality, sportsmanship, actual_level')
    .eq('rated_id', userId);

  if (!ratings || ratings.length === 0) return;

  const avgPunctuality = ratings.reduce((sum, r) => sum + (r.punctuality || 0), 0) / ratings.length;
  const avgSportsmanship = ratings.reduce((sum, r) => sum + (r.sportsmanship || 0), 0) / ratings.length;
  const avgLevel = ratings.reduce((sum, r) => sum + (r.actual_level || 0), 0) / ratings.length;

  const overallRating = (avgPunctuality + avgSportsmanship + avgLevel) / 3;

  // Update profile rating
  await supabase
    .from('profiles')
    .update({ avg_rating: overallRating })
    .eq('id', userId);

  // Check if level should be adjusted
  const newLevel = ratingToLevel(avgLevel);
  if (newLevel) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('level')
      .eq('id', userId)
      .single();

    if (profile && profile.level !== newLevel) {
      await supabase
        .from('profiles')
        .update({ level: newLevel })
        .eq('id', userId);
    }
  }
}

function ratingToLevel(avgLevel: number): SkillLevel | null {
  if (avgLevel <= 1.5) return 'muy_principiante';
  if (avgLevel <= 2.5) return 'principiante';
  if (avgLevel <= 3.5) return 'intermedi';
  if (avgLevel <= 4.5) return 'avancat';
  if (avgLevel > 4.5) return 'competitiu';
  return null;
}

export async function getPendingRatings(matchId: string): Promise<(Profile & { already_rated: boolean })[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get all players in the match except current user
  const { data: matchPlayers } = await supabase
    .from('match_players')
    .select('user_id')
    .eq('match_id', matchId)
    .neq('user_id', user.id);

  if (!matchPlayers) return [];

  // Check which players have already been rated
  const { data: existingRatings } = await supabase
    .from('ratings')
    .select('rated_id')
    .eq('match_id', matchId)
    .eq('rater_id', user.id);

  const ratedIds = new Set(existingRatings?.map(r => r.rated_id) || []);

  // Get profiles
  const playerIds = matchPlayers.map(p => p.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', playerIds);

  if (!profiles) return [];

  return profiles.map(p => ({
    ...p,
    already_rated: ratedIds.has(p.id),
  }));
}

export async function hasPendingRatings(matchId: string): Promise<boolean> {
  const pending = await getPendingRatings(matchId);
  return pending.some(p => !p.already_rated);
}

export async function getMatchRatings(matchId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('match_id', matchId);

  if (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }

  return data || [];
}
