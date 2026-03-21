-- User accounts for The Porch
-- Run this in Supabase SQL editor after migration.sql

-- Add user_id column to posts (nullable - existing posts and anon posts have null)
alter table posts add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table responses add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Add location fields to posts
alter table posts add column if not exists location_label text; -- human-readable neighbourhood like "Old East Village"
alter table posts add column if not exists location_lat double precision;
alter table posts add column if not exists location_lng double precision;

-- Neighbourhood lookup table (London, ON neighbourhoods)
create table if not exists neighbourhoods (
  id serial primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null
);

-- Seed London, ON neighbourhoods
insert into neighbourhoods (name, lat, lng) values
  ('Old East Village', 42.9890, -81.2250),
  ('Old South', 42.9620, -81.2390),
  ('Byron', 42.9580, -81.2950),
  ('Wortley Village', 42.9680, -81.2490),
  ('Argyle', 42.9820, -81.2530),
  ('Carling Heights', 42.9900, -81.2650),
  ('Huron Heights', 43.0010, -81.2850),
  ('Masonville', 43.0280, -81.2650),
  ('Hyde Park', 43.0100, -81.3250),
  ('Lambeth', 42.9180, -81.2650),
  ('Westminster', 42.9380, -81.2650),
  ('Pond Mills', 42.9450, -81.2250),
  ('Southcrest', 42.9550, -81.2150),
  ('Fanshawe', 43.0200, -81.2400),
  ('White Hills', 43.0050, -81.2500),
  ('Downtown', 42.9849, -81.2453),
  ('Old North', 43.0100, -81.2450),
  ('Medway', 43.0300, -81.2900),
  ('Stoney Creek', 43.0000, -81.2200),
  ('Whitehills', 43.0050, -81.2750)
on conflict do nothing;

-- Index for geo queries
create index if not exists idx_posts_location on posts(location_lat, location_lng) where location_lat is not null;
create index if not exists idx_posts_user_id on posts(user_id) where user_id is not null;

-- RLS: users can only update/delete their own posts (or posts with no user = legacy/anon)
-- Existing permissive policies stay for insert and select

-- Allow users to update only their own posts OR posts with no user_id
drop policy if exists "Anyone can update posts" on posts;
create policy "Users can update own posts or anon posts" on posts
  for update using (
    user_id is null OR auth.uid() = user_id
  );
