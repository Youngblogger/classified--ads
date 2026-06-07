-- Create watermark_settings table for persisting watermark configuration
CREATE TABLE IF NOT EXISTS watermark_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  enabled BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'logo')),
  text TEXT NOT NULL DEFAULT 'iList',
  logo_url TEXT,
  text_color TEXT NOT NULL DEFAULT '#FFFFFF',
  shadow_color TEXT NOT NULL DEFAULT '#000000',
  shadow_opacity INTEGER NOT NULL DEFAULT 50,
  position TEXT NOT NULL DEFAULT 'bottom_right' CHECK (position IN ('bottom_right','bottom_left','top_right','top_left','center')),
  opacity INTEGER NOT NULL DEFAULT 80,
  font_size INTEGER NOT NULL DEFAULT 36,
  font_family TEXT DEFAULT 'arial',
  font_path TEXT,
  margin INTEGER NOT NULL DEFAULT 20,
  rotation INTEGER NOT NULL DEFAULT 0,
  show_ad_id BOOLEAN NOT NULL DEFAULT true,
  apply_to_original BOOLEAN NOT NULL DEFAULT true,
  apply_to_medium BOOLEAN NOT NULL DEFAULT true,
  apply_to_thumbnail BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Insert default row if not exists
INSERT INTO watermark_settings (id, enabled, type, text)
VALUES ('default', false, 'text', 'iList')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE watermark_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Watermark settings read" ON watermark_settings;
CREATE POLICY "Watermark settings read" ON watermark_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Watermark settings write" ON watermark_settings;
CREATE POLICY "Watermark settings write" ON watermark_settings FOR ALL USING (true);

-- Enable realtime for live sync
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY watermark_settings;
