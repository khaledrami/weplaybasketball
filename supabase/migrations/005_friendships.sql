-- WePlayBasketball: Friendships

CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can read friendships where they are involved
CREATE POLICY "Friendships own read" ON friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can send friend requests
CREATE POLICY "Friendships auth insert" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Users can update (accept/reject) requests addressed to them
CREATE POLICY "Friendships addressee update" ON friendships
  FOR UPDATE USING (auth.uid() = addressee_id);

-- Either party can remove a friendship
CREATE POLICY "Friendships own delete" ON friendships
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
