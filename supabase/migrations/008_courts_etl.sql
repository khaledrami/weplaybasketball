-- WePlayBasketball: ETL-enhanced court schema
-- ADDITIVE migration — extends the base schema from 001_courts.sql
-- Does NOT drop or rename the courts table (preserves FK relationships)

-- ============================================================
-- 1. Add ETL columns to existing courts table
-- ============================================================
DO $$
BEGIN
  -- Data provenance columns (if not already present)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courts' AND column_name='source_id') THEN
    ALTER TABLE courts ADD COLUMN source_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courts' AND column_name='last_updated') THEN
    ALTER TABLE courts ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courts' AND column_name='surface_condition') THEN
    ALTER TABLE courts ADD COLUMN surface_condition TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courts' AND column_name='area_m2') THEN
    ALTER TABLE courts ADD COLUMN area_m2 REAL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courts' AND column_name='dimensions') THEN
    ALTER TABLE courts ADD COLUMN dimensions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courts' AND column_name='year_inaugurated') THEN
    ALTER TABLE courts ADD COLUMN year_inaugurated INTEGER;
  END IF;
END $$;

-- Unique constraint for ETL upsert (source + source_id)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='courts_source_unique') THEN
    ALTER TABLE courts ADD CONSTRAINT courts_source_unique UNIQUE (source, source_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_courts_source    ON courts(source);
CREATE INDEX IF NOT EXISTS idx_courts_location  ON courts(lat, lng);

-- ============================================================
-- 2. court_data_sources — audit trail of every data point
-- ============================================================
CREATE TABLE IF NOT EXISTS court_data_sources (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id      UUID REFERENCES courts(id) ON DELETE CASCADE,
  source_name   TEXT NOT NULL,       -- 'diba','osm','ajuntament'
  source_id     TEXT,                -- ID in the source system
  field_name    TEXT NOT NULL,       -- e.g. 'lat','phone','opening_hours'
  field_value   TEXT,                -- raw value from source (NULL if absent)
  fetched_at    TIMESTAMPTZ DEFAULT NOW(),
  confidence    TEXT DEFAULT 'medium'
);

CREATE INDEX IF NOT EXISTS idx_cds_court ON court_data_sources(court_id);
CREATE INDEX IF NOT EXISTS idx_cds_field ON court_data_sources(field_name);

-- ============================================================
-- 3. court_community — user-contributed layer (separate from official)
-- ============================================================
CREATE TABLE IF NOT EXISTS court_community (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id      UUID REFERENCES courts(id) ON DELETE CASCADE,
  user_id       UUID,
  field_name    TEXT NOT NULL,       -- 'condition','occupied','photo','comment','checkin'
  field_value   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_court ON court_community(court_id);

-- ============================================================
-- 4. etl_runs — log each ETL execution
-- ============================================================
CREATE TABLE IF NOT EXISTS etl_runs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name   TEXT NOT NULL,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  finished_at   TIMESTAMPTZ,
  records_extracted  INTEGER DEFAULT 0,
  records_upserted   INTEGER DEFAULT 0,
  errors        INTEGER DEFAULT 0,
  details       JSONB
);

-- ============================================================
-- 5. RLS policies for new tables
-- ============================================================
-- Courts: allow public read, allow authenticated + service_role writes
-- (ETL uses anon key, so we need to allow inserts for data loading)
-- In production, tighten this to service_role only
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_community ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Drop old restrictive policies if they exist
  DROP POLICY IF EXISTS "Courts public read" ON courts;
  DROP POLICY IF EXISTS "Courts auth insert" ON courts;
  DROP POLICY IF EXISTS "Courts service write" ON courts;

  -- Recreate: public read, authenticated + anon can write (for ETL)
  CREATE POLICY "Courts public read" ON courts FOR SELECT USING (true);
  CREATE POLICY "Courts insert update" ON courts FOR ALL
    USING (true)
    WITH CHECK (true);
END $$;

-- exec_sql function for ETL (runs as definer, bypasses RLS)
CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Community public read' AND tablename='court_community') THEN
    CREATE POLICY "Community public read" ON court_community FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Community auth insert' AND tablename='court_community') THEN
    CREATE POLICY "Community auth insert" ON court_community FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;
