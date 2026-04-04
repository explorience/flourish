-- Add expiry tracking columns to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS expiry_reminder_sent boolean DEFAULT false;

-- Backfill existing posts: set expires_at to 30 days after creation
UPDATE posts SET expires_at = created_at + interval '30 days' WHERE expires_at IS NULL;
