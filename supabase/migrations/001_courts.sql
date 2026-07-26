-- WePlayBasketball: Court Database Schema
-- Run this migration to create the courts table

CREATE TABLE IF NOT EXISTS courts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  barrio TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geohash TEXT NOT NULL,
  access_type TEXT CHECK (access_type IN ('lliure', 'restringit', 'parcial')) NOT NULL,
  court_type TEXT CHECK (court_type IN ('outdoor', 'indoor', 'covered')) DEFAULT 'outdoor',
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
  opening_hours TEXT,
  source TEXT NOT NULL,
  confidence TEXT DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courts_geohash ON courts(geohash);
CREATE INDEX IF NOT EXISTS idx_courts_access ON courts(access_type);
CREATE INDEX IF NOT EXISTS idx_courts_barrio ON courts(barrio);

-- Enable RLS
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Courts public read" ON courts FOR SELECT USING (true);

-- Only authenticated users can insert (admin will be separate)
CREATE POLICY "Courts auth insert" ON courts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
