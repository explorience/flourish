CREATE TABLE IF NOT EXISTS post_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);
ALTER TABLE post_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read upvotes" ON post_upvotes FOR SELECT USING (true);
CREATE POLICY "Auth users insert own" ON post_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users delete own" ON post_upvotes FOR DELETE USING (auth.uid() = user_id);
