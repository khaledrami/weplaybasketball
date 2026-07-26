-- WePlayBasketball: Post-Match Ratings

CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rated_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  sportsmanship INTEGER CHECK (sportsmanship >= 1 AND sportsmanship <= 5),
  actual_level INTEGER CHECK (actual_level >= 1 AND actual_level <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, rater_id, rated_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ratings_match ON ratings(match_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated ON ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater ON ratings(rater_id);

-- RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Ratings: participants of the match can read
CREATE POLICY "Ratings match participants read" ON ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM match_players mp
      WHERE mp.match_id = ratings.match_id AND mp.user_id = auth.uid()
    )
  );

-- Ratings: insert as self
CREATE POLICY "Ratings auth insert" ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Function to update a player's avg_rating after new rating
CREATE OR REPLACE FUNCTION update_player_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET avg_rating = (
    SELECT COALESCE(AVG(
      (COALESCE(punctuality, 3) + COALESCE(sportsmanship, 3) + COALESCE(actual_level, 3)) / 3.0
    ), 3)
    FROM ratings
    WHERE rated_id = NEW.rated_id
  )
  WHERE id = NEW.rated_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_rating_created
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_player_avg_rating();
