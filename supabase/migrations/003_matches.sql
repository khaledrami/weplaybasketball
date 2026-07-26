-- WePlayBasketball: Matches & Match Players

CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  court_id UUID REFERENCES courts(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_players INTEGER DEFAULT 10,
  current_players INTEGER DEFAULT 1,
  level_required TEXT CHECK (level_required IN ('muy_principiante', 'principiante', 'intermedi', 'avancat', 'competitiu')),
  language TEXT DEFAULT 'Català',
  is_mixed BOOLEAN DEFAULT true,
  status TEXT CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team TEXT CHECK (team IN ('A', 'B')),
  role TEXT CHECK (role IN ('player', 'waitlist')) DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_creator ON matches(creator_id);
CREATE INDEX IF NOT EXISTS idx_matches_court ON matches(court_id);
CREATE INDEX IF NOT EXISTS idx_match_players_match ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_user ON match_players(user_id);

-- RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- Matches: public read
CREATE POLICY "Matches public read" ON matches FOR SELECT USING (true);

-- Matches: authenticated insert
CREATE POLICY "Matches auth insert" ON matches FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Matches: creator can update/delete own
CREATE POLICY "Matches creator update" ON matches FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Matches creator delete" ON matches FOR DELETE USING (auth.uid() = creator_id);

-- Match players: public read
CREATE POLICY "Match players public read" ON match_players FOR SELECT USING (true);

-- Match players: join (insert as self)
CREATE POLICY "Match players join" ON match_players FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Match players: leave (delete own)
CREATE POLICY "Match players leave" ON match_players FOR DELETE USING (auth.uid() = user_id);

-- Match players: update own entry (team assignment)
CREATE POLICY "Match players update own" ON match_players FOR UPDATE USING (auth.uid() = user_id);
