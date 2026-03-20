-- Mutual Exchange App Schema
-- Run this in your Supabase SQL editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Posts table
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('need', 'offer')),
  title text not null,
  details text,
  category text not null default 'other' check (category in ('items', 'services', 'skills', 'space', 'other')),
  urgency text not null default 'flexible' check (urgency in ('flexible', 'this_week', 'today')),
  contact_name text not null,
  contact_method text not null default 'app' check (contact_method in ('app', 'phone', 'email')),
  contact_value text,
  source text not null default 'web' check (source in ('web', 'sms')),
  source_phone text,
  status text not null default 'active' check (status in ('active', 'fulfilled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Responses table
create table if not exists responses (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  responder_name text not null,
  responder_contact text,
  message text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_posts_type on posts(type);
create index if not exists idx_posts_category on posts(category);
create index if not exists idx_posts_status on posts(status);
create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_responses_post_id on responses(post_id);

-- Enable Row Level Security (permissive for demo)
alter table posts enable row level security;
alter table responses enable row level security;

-- Allow anyone to read posts
create policy "Posts are viewable by everyone" on posts
  for select using (true);

-- Allow anyone to insert posts (no auth for demo)
create policy "Anyone can create posts" on posts
  for insert with check (true);

-- Allow anyone to update posts
create policy "Anyone can update posts" on posts
  for update using (true);

-- Allow anyone to read responses
create policy "Responses are viewable by everyone" on responses
  for select using (true);

-- Allow anyone to insert responses
create policy "Anyone can create responses" on responses
  for insert with check (true);

-- Enable realtime for posts and responses
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table responses;

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();
