-- Create admin_settings table for persisting approval configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  auto_approval_enabled BOOLEAN NOT NULL DEFAULT false,
  approval_duration_minutes INTEGER NOT NULL DEFAULT 2,
  max_images_per_ad INTEGER NOT NULL DEFAULT 10,
  ad_expiration_days INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Insert default row if not exists
INSERT INTO admin_settings (id, auto_approval_enabled, approval_duration_minutes, max_images_per_ad, ad_expiration_days)
VALUES ('default', false, 2, 10, 30)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write (handled via service_role in API route)
DROP POLICY IF EXISTS "Admin settings read" ON admin_settings;
CREATE POLICY "Admin settings read" ON admin_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin settings write" ON admin_settings;
CREATE POLICY "Admin settings write" ON admin_settings FOR ALL USING (true);

-- Enable realtime for live sync
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY admin_settings;
