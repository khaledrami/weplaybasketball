import { supabase } from './supabase';
import { Profile, PlayerTeam } from './types';

interface TeamPlayer {
  user_id: string;
  profile: Profile;
  team_score: number;
}

interface BalancedTeams {
  teamA: string[];
  teamB: string[];
  scoreA: number;
  scoreB: number;
}

export async function autoBalanceTeams(matchId: string): Promise<BalancedTeams | null> {
  // Get all players in the match
  const { data: matchPlayers, error: playersError } = await supabase
    .from('match_players')
    .select(`
      user_id,
      profile:profiles(*)
    `)
    .eq('match_id', matchId)
    .eq('role', 'player');

  if (playersError || !matchPlayers || matchPlayers.length < 2) {
    console.error('Error fetching players:', playersError);
    return null;
  }

  // Calculate team score for each player
  const teamPlayers: TeamPlayer[] = matchPlayers.map((mp: any) => ({
    user_id: mp.user_id,
    profile: mp.profile,
    team_score: calculateTeamScore(mp.profile),
  }));

  // Sort by score descending
  teamPlayers.sort((a, b) => b.team_score - a.team_score);

  // Snake draft assignment
  const teamA: string[] = [];
  const teamB: string[] = [];
  let scoreA = 0;
  let scoreB = 0;

  teamPlayers.forEach((player, index) => {
    if (index % 2 === 0) {
      // Alternating: A gets 1st, 4th, 5th, 8th...
      if (teamA.length <= teamB.length) {
        teamA.push(player.user_id);
        scoreA += player.team_score;
      } else {
        teamB.push(player.user_id);
        scoreB += player.team_score;
      }
    } else {
      // Alternating: B gets 2nd, 3rd, 6th, 7th...
      if (teamB.length <= teamA.length) {
        teamB.push(player.user_id);
        scoreB += player.team_score;
      } else {
        teamA.push(player.user_id);
        scoreA += player.team_score;
      }
    }
  });

  // Update database with team assignments
  for (const userId of teamA) {
    await supabase
      .from('match_players')
      .update({ team: 'A' as PlayerTeam })
      .eq('match_id', matchId)
      .eq('user_id', userId);
  }

  for (const userId of teamB) {
    await supabase
      .from('match_players')
      .update({ team: 'B' as PlayerTeam })
      .eq('match_id', matchId)
      .eq('user_id', userId);
  }

  return { teamA, teamB, scoreA, scoreB };
}

function calculateTeamScore(profile: Profile): number {
  const levelScores: Record<string, number> = {
    muy_principiante: 1,
    principiante: 2,
    intermedi: 3,
    avancat: 4,
    competitiu: 5,
  };

  const levelScore = levelScores[profile.level] || 3;
  const heightBonus = profile.height_cm ? Math.min((profile.height_cm - 160) / 20, 2) : 0;
  const ratingBonus = profile.avg_rating ? (profile.avg_rating - 3) * 0.5 : 0;
  const experienceBonus = Math.min(profile.matches_played / 50, 1);

  return levelScore + heightBonus + ratingBonus + experienceBonus;
}

export async function getTeamAssignments(matchId: string): Promise<Record<string, PlayerTeam>> {
  const { data: matchPlayers } = await supabase
    .from('match_players')
    .select('user_id, team')
    .eq('match_id', matchId);

  if (!matchPlayers) return {};

  const assignments: Record<string, PlayerTeam> = {};
  matchPlayers.forEach(mp => {
    assignments[mp.user_id] = mp.team as PlayerTeam;
  });

  return assignments;
}

export async function resetTeams(matchId: string): Promise<boolean> {
  const { error } = await supabase
    .from('match_players')
    .update({ team: null })
    .eq('match_id', matchId);

  if (error) {
    console.error('Error resetting teams:', error);
    return false;
  }

  return true;
}

export function getTeamBalanceInfo(teamA: string[], teamB: string[], scoreA: number, scoreB: number): {
  isBalanced: boolean;
  difference: number;
  message: string;
} {
  const difference = Math.abs(scoreA - scoreB);
  const isBalanced = difference < 2;

  let message: string;
  if (isBalanced) {
    message = 'Equips equilibrats!';
  } else if (difference < 3) {
    message = 'Equips força equilibrats';
  } else {
    message = 'Equips desequilibrats';
  }

  return { isBalanced, difference, message };
}
