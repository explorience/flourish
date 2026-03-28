-- ============================================================
-- Flourish — Moderation System Migration
-- Run this in the Supabase SQL editor
-- ============================================================

-- Moderators table
CREATE TABLE IF NOT EXISTS moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'mod' CHECK (role IN ('admin', 'mod')),
  name text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Add moderation fields to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'rejected', 'pending'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderated_by uuid;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Moderation log
CREATE TABLE IF NOT EXISTS moderation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id),
  moderator_id uuid REFERENCES moderators(id),
  action text NOT NULL CHECK (action IN ('approve', 'reject')),
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Seed admin
INSERT INTO moderators (email, role, name)
VALUES ('1heenal@gmail.com', 'admin', 'Heenal')
ON CONFLICT (email) DO NOTHING;

-- ── RLS ──────────────────────────────────────────────────────

-- Moderators table
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by admin API routes)
CREATE POLICY "Service role full access on moderators"
  ON moderators FOR ALL
  USING (true)
  WITH CHECK (true);

-- Moderation log
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on moderation_log"
  ON moderation_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON posts (moderation_status);
CREATE INDEX IF NOT EXISTS idx_moderators_email ON moderators (email);
CREATE INDEX IF NOT EXISTS idx_moderation_log_post_id ON moderation_log (post_id);
