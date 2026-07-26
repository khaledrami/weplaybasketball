-- WePlayBasketball: Admins

CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('super_admin', 'moderator')) DEFAULT 'moderator',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admins_user ON admins(user_id);

-- RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can read admin list
CREATE POLICY "Admins super admin read" ON admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Only super admins can manage admins
CREATE POLICY "Admins super admin insert" ON admins
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins super admin delete" ON admins
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'super_admin')
  );
