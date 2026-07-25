# Design: WePlayBasketball

## Technical Approach

React Native (Expo) + Supabase full-stack. Supabase handles Auth, PostgreSQL DB with RLS, Realtime subscriptions, Storage, and Edge Functions. Google Maps for primary map display with OSM fallback. Firebase Cloud Messaging for push notifications via Expo.

## Architecture Decisions

### Decision: Supabase as Full Backend
| Option | Tradeoff | Decision |
|--------|----------|----------|
| Supabase | Faster MVP, built-in auth/realtime/RLS, vendor lock-in | **Chosen** — vendor risk acceptable for startup speed |
| Firebase + custom API | More control, more boilerplate, separate auth/DB | Rejected — double the work |
| Custom (NestJS + Postgres) | Full control, months of setup | Rejected — not viable for solo dev |

### Decision: Google Maps + OSM Fallback
| Option | Tradeoff | Decision |
|--------|----------|----------|
| Google Maps only | Best UX, API costs scale | **Chosen** (primary) |
| OSM only | Free, worse UX in Spain | Fallback only |
| Mapbox | Good middle ground | Rejected — extra dependency |

### Decision: Geohash for Proximity
| Option | Tradeoff | Decision |
|--------|----------|----------|
| PostGIS spatial | Most powerful, heavier setup | Rejected — overkill for 56 courts |
| Geohash column | Simple, fast, good enough for city-scale | **Chosen** |
| Haversine in query | Flexible, slower at scale | Rejected |

## Data Flow

```
User → Expo App → Supabase Client SDK
                      ├─ Auth (Google/Apple/Email)
                      ├─ PostgreSQL (courts, matches, profiles)
                      ├─ Realtime (chat subscriptions)
                      ├─ Storage (photos)
                      └─ Edge Functions (reminders, balancing)
                           └─ Firebase Admin → Push Notifications
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/` | Create | Expo Router screens (tab + stack) |
| `lib/supabase.ts` | Create | Supabase client initialization |
| `lib/i18n.ts` | Create | i18n setup with ca/es translations |
| `locales/ca.json` | Create | Catalan translations |
| `locales/es.json` | Create | Spanish translations |
| `components/map/` | Create | Map view, markers, clustering |
| `components/match/` | Create | Match cards, create form, detail |
| `components/chat/` | Create | Chat room, message bubbles |
| `components/profile/` | Create | Profile views, stats, ratings |
| `supabase/migrations/` | Create | Database schema migrations |
| `supabase/seed.sql` | Create | 56+ court seed data |
| `supabase/functions/` | Create | Edge functions (reminders, balance) |

## Database Schema

```sql
-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT NOT NULL,
  age INTEGER,
  height_cm INTEGER,
  position TEXT CHECK (position IN ('base','aler','pivot','flexible')),
  dominant_hand TEXT CHECK (dominant_hand IN ('left','right','ambidextrous')),
  level TEXT DEFAULT 'intermedi' CHECK (level IN ('muy_principiante','principiante','intermedi','avancat','competitiu')),
  languages TEXT[] DEFAULT '{ca}',
  photo_url TEXT,
  matches_played INTEGER DEFAULT 0,
  hours_played REAL DEFAULT 0,
  mvp_count INTEGER DEFAULT 0,
  attendance_rate REAL DEFAULT 1.0,
  avg_rating REAL DEFAULT 0,
  is_profile_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courts (56+ verified Badalona courts)
CREATE TABLE courts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  barrio TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geohash TEXT NOT NULL,
  access_type TEXT CHECK (access_type IN ('lliure','restringit','parcial')),
  court_type TEXT CHECK (court_type IN ('outdoor','indoor','covered')),
  hoops INTEGER DEFAULT 2,
  surface TEXT,
  has_lighting BOOLEAN,
  has_nets BOOLEAN,
  is_accessible BOOLEAN,
  has_parking BOOLEAN,
  nearest_transport TEXT,
  manager TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  source TEXT NOT NULL,
  confidence TEXT DEFAULT 'medium' CHECK (confidence IN ('high','medium','low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  court_id UUID REFERENCES courts(id) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_players INTEGER DEFAULT 10,
  current_players INTEGER DEFAULT 1,
  level_required TEXT CHECK (level_required IN ('any','muy_principiante','principiante','intermedi','avancat','competitiu')),
  language TEXT DEFAULT 'ca',
  is_mixed BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','full','in_progress','completed','cancelled')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match Players (join table)
CREATE TABLE match_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  team TEXT CHECK (team IN ('A','B',NULL)),
  role TEXT DEFAULT 'player' CHECK (role IN ('player','waitlist')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_id)
);

-- Messages (per-match chat)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings (post-match)
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  rater_id UUID REFERENCES profiles(id),
  rated_id UUID REFERENCES profiles(id),
  punctuality INTEGER CHECK (punctuality BETWEEN 1 AND 5),
  sportsmanship INTEGER CHECK (sportsmanship BETWEEN 1 AND 5),
  actual_level INTEGER CHECK (actual_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, rater_id, rated_id)
);

-- Friendships
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id),
  addressee_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Indexes
CREATE INDEX idx_courts_geohash ON courts(geohash);
CREATE INDEX idx_courts_access ON courts(access_type);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX idx_match_players_match ON match_players(match_id);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_ratings_rated ON ratings(rated_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Profiles public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles owner update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Courts: public read
CREATE POLICY "Courts public read" ON courts FOR SELECT USING (true);

-- Matches: public read, authenticated write
CREATE POLICY "Matches public read" ON matches FOR SELECT USING (true);
CREATE POLICY "Matches auth create" ON matches FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Matches creator update" ON matches FOR UPDATE USING (auth.uid() = creator_id);

-- Match Players: participants read, auth write
CREATE POLICY "Match players read" ON match_players FOR SELECT
  USING (EXISTS (SELECT 1 FROM match_players mp WHERE mp.match_id = match_players.match_id AND mp.user_id = auth.uid()));
CREATE POLICY "Match players join" ON match_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Match players leave" ON match_players FOR DELETE USING (auth.uid() = user_id);

-- Messages: match participants read/write
CREATE POLICY "Messages read" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM match_players mp WHERE mp.match_id = messages.match_id AND mp.user_id = auth.uid()));
CREATE POLICY "Messages insert" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM match_players mp WHERE mp.match_id = messages.match_id AND mp.user_id = auth.uid()));

-- Ratings: anonymous, only own rater can read
CREATE POLICY "Ratings own read" ON ratings FOR SELECT USING (auth.uid() = rater_id OR auth.uid() = rated_id);
CREATE POLICY "Ratings insert" ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | i18n translations, level calculation, team balance | Jest + React Testing Library |
| Integration | Supabase queries, RLS policies | Supabase test client, pgTAP |
| E2E | Match flow (create → join → chat → rate) | Detox or Maestro |

## Migration / Rollout

No migration required — greenfield project. Seed data loaded via `supabase/seed.sql` with all 56+ courts.

Phased rollout:
1. Internal testing (TestFlight + Expo dev build)
2. Closed beta with BBB club members
3. Public launch on App Store + Play Store

## Open Questions

- [ ] Should chat support images/emojis in MVP or text-only?
- [ ] What's the team balancing algorithm weight distribution?
- [ ] Should court photos be moderated before display?
- [ ] Expo push notification token vs raw FCM — which is simpler?
