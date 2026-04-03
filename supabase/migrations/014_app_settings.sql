-- App-wide settings (feature flags, configuration)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'false'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Settings are readable by everyone"
  ON public.app_settings FOR SELECT USING (true);

-- Only service role can write (via admin API routes)
-- No INSERT/UPDATE policies for anon/authenticated - admin routes use service role client

-- Seed the vouch toggle (OFF by default)
INSERT INTO public.app_settings (key, value) VALUES
  ('require_vouch', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
