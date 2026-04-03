-- Add email notification preferences
-- If profiles table exists (from migration 001), add column; otherwise create minimal table

-- Create profiles table if it doesn't exist (in case migrations run independently)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null default '',
  neighbourhood text,
  bio text check (char_length(bio) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add email_notifications column (default true)
alter table public.profiles
  add column if not exists email_notifications boolean not null default true;

-- Ensure RLS is enabled
alter table public.profiles enable row level security;

-- Policies (idempotent with IF NOT EXISTS pattern via DO blocks)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Profiles are viewable by everyone' and tablename = 'profiles') then
    create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own profile' and tablename = 'profiles') then
    create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update their own profile' and tablename = 'profiles') then
    create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;
