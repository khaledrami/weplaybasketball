-- WePlayBasketball: Player Profiles
-- Links to Supabase auth.users via id

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  age INTEGER,
  height_cm INTEGER,
  position TEXT CHECK (position IN ('base', 'aler', 'pivot', 'flexible')),
  dominant_hand TEXT CHECK (dominant_hand IN ('left', 'right', 'ambidextrous')),
  level TEXT CHECK (level IN ('muy_principiante', 'principiante', 'intermedi', 'avancat', 'competitiu')) NOT NULL DEFAULT 'principiante',
  languages TEXT[] DEFAULT ARRAY['ca'],
  photo_url TEXT,
  matches_played INTEGER DEFAULT 0,
  hours_played NUMERIC DEFAULT 0,
  mvp_count INTEGER DEFAULT 0,
  attendance_rate NUMERIC DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  is_profile_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    'principiante'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_position ON profiles(position);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read for profile discovery
CREATE POLICY "Profiles public read" ON profiles FOR SELECT USING (is_profile_public = true);

-- Users can read own profile (private fields)
CREATE POLICY "Profiles own read" ON profiles FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Profiles own update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Authenticated users can insert (triggered on signup)
CREATE POLICY "Profiles auth insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
