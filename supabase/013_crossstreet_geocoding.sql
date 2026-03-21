-- Cross-street geocoding with fuzzed public coords
-- Run after 012_user_accounts.sql

-- Store the cross-street text the user provided
alter table posts add column if not exists location_crossstreet text;

-- Fuzzed coordinates for public map display (offset 50-100m from real)
alter table posts add column if not exists location_fuzzed_lat double precision;
alter table posts add column if not exists location_fuzzed_lng double precision;

-- Index for fuzzed coords (used for map queries)
create index if not exists idx_posts_fuzzed_location 
  on posts(location_fuzzed_lat, location_fuzzed_lng) 
  where location_fuzzed_lat is not null;
