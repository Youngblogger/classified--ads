-- Add logo_scale column for admin-controllable logo watermark size
ALTER TABLE watermark_settings
  ADD COLUMN IF NOT EXISTS logo_scale REAL NOT NULL DEFAULT 0.15;

-- Constrain to reasonable range (5% to 50%)
ALTER TABLE watermark_settings
  ADD CONSTRAINT watermark_settings_logo_scale_check
  CHECK (logo_scale >= 0.05 AND logo_scale <= 0.50);
