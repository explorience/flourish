-- User accounts and location fields for Flourish
-- Run this in Supabase SQL editor

-- Add user_id column to posts (nullable - existing/anon posts have null)
alter table posts add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table responses add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Add location fields to posts
alter table posts add column if not exists location_label text;
alter table posts add column if not exists location_lat double precision;
alter table posts add column if not exists location_lng double precision;

-- Index for user_id lookups (account page)
create index if not exists idx_posts_user_id on posts(user_id) where user_id is not null;

-- RLS: users can update their own posts; anon posts (no user_id) remain updatable by anyone
drop policy if exists "Anyone can update posts" on posts;
create policy "Users can update own posts or anon posts" on posts
  for update using (
    user_id is null OR auth.uid() = user_id
  );
