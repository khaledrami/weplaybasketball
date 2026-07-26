-- WePlayBasketball: Court Photos + Messages

CREATE TABLE IF NOT EXISTS court_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID REFERENCES courts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_court_photos_court ON court_photos(court_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- RLS
ALTER TABLE court_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Court photos: public read
CREATE POLICY "Court photos public read" ON court_photos FOR SELECT USING (true);

-- Court photos: authenticated insert
CREATE POLICY "Court photos auth insert" ON court_photos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Court photos: own delete
CREATE POLICY "Court photos own delete" ON court_photos FOR DELETE USING (auth.uid() = user_id);

-- Messages: match participants can read
CREATE POLICY "Messages match participants read" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM match_players mp
      WHERE mp.match_id = messages.match_id AND mp.user_id = auth.uid()
    )
  );

-- Messages: authenticated insert as self
CREATE POLICY "Messages auth insert" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for court photos
INSERT INTO storage.buckets (id, name, public) VALUES ('court-photos', 'court-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Court photos storage public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'court-photos');

CREATE POLICY "Court photos storage auth insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'court-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Court photos storage auth delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'court-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
