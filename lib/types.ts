export type Position = 'base' | 'aler' | 'pivot' | 'flexible';
export type DominantHand = 'left' | 'right' | 'ambidextrous';
export type SkillLevel = 'muy_principiante' | 'principiante' | 'intermedi' | 'avancat' | 'competitiu';
export type AccessType = 'lliure' | 'restringit' | 'parcial';
export type CourtType = 'outdoor' | 'indoor' | 'covered';
export type MatchStatus = 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
export type PlayerTeam = 'A' | 'B' | null;
export type PlayerRole = 'player' | 'waitlist';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Profile {
  id: string;
  display_name: string;
  age?: number;
  height_cm?: number;
  position?: Position;
  dominant_hand?: DominantHand;
  level: SkillLevel;
  languages: string[];
  photo_url?: string;
  matches_played: number;
  hours_played: number;
  mvp_count: number;
  attendance_rate: number;
  avg_rating: number;
  is_profile_public: boolean;
  created_at: string;
}

export interface Court {
  id: string;
  name: string;
  address: string;
  barrio?: string;
  lat: number;
  lng: number;
  geohash: string;
  access_type: AccessType;
  court_type?: CourtType;
  hoops: number;
  surface?: string;
  has_lighting?: boolean;
  has_nets?: boolean;
  is_accessible?: boolean;
  has_parking?: boolean;
  nearest_transport?: string;
  manager?: string;
  phone?: string;
  email?: string;
  website?: string;
  photo_urls: string[];
  source: string;
  confidence: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface Match {
  id: string;
  creator_id: string;
  court_id: string;
  scheduled_at: string;
  duration_minutes: number;
  max_players: number;
  current_players: number;
  level_required?: SkillLevel;
  language: string;
  is_mixed: boolean;
  status: MatchStatus;
  description?: string;
  created_at: string;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  user_id: string;
  team?: PlayerTeam;
  role: PlayerRole;
  joined_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Rating {
  id: string;
  match_id: string;
  rater_id: string;
  rated_id: string;
  punctuality?: number;
  sportsmanship?: number;
  actual_level?: number;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
}
