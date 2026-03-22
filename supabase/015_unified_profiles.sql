-- Migration 015: Unified profiles table
-- Replaces sms_users with a single profiles table covering both SMS and web users
-- SMS users get a row immediately with user_id=null
-- Web users get user_id set when they authenticate
-- Linking: if SMS user later auths on web (or vice versa), records merge via phone or email

-- Create the unified profiles table
create table if not exists public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid unique references auth.users(id) on delete set null,  -- null for SMS-only users
  phone       text unique,                                                 -- null for web-only users
  email       text,                                                        -- for future linking
  display_name text not null default 'Neighbour',
  avatar_url  text,
  created_via text not null default 'web' check (created_via in ('sms', 'web', 'email')),
  total_points integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Migrate existing sms_users into profiles
insert into public.profiles (id, phone, display_name, created_via, created_at, updated_at)
select id, phone, coalesce(name, 'Neighbour'), 'sms', created_at, last_active_at
from public.sms_users
on conflict (phone) do nothing;

-- Indexes
create index if not exists idx_profiles_phone   on public.profiles(phone)   where phone is not null;
create index if not exists idx_profiles_user_id on public.profiles(user_id) where user_id is not null;
create index if not exists idx_profiles_email   on public.profiles(email)   where email is not null;

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- Trigger: when a new web user signs up, create or link their profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- If a phone-based profile exists for this phone number, link it
  if new.phone is not null then
    update public.profiles
    set
      user_id      = new.id,
      email        = coalesce(profiles.email, new.email),
      display_name = coalesce(nullif(profiles.display_name, 'Neighbour'),
                              new.raw_user_meta_data->>'display_name',
                              new.raw_user_meta_data->>'full_name',
                              split_part(new.email, '@', 1)),
      avatar_url   = coalesce(profiles.avatar_url, new.raw_user_meta_data->>'avatar_url')
    where phone = new.phone and user_id is null;

    if found then
      return new;
    end if;
  end if;

  -- Otherwise create a fresh web profile
  insert into public.profiles (id, user_id, email, display_name, avatar_url, created_via)
  values (
    new.id,
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name',
             new.raw_user_meta_data->>'full_name',
             split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'web'
  )
  on conflict (id) do update set
    user_id      = new.id,
    email        = coalesce(profiles.email, new.email),
    display_name = coalesce(nullif(profiles.display_name, 'Neighbour'),
                            new.raw_user_meta_data->>'display_name',
                            new.raw_user_meta_data->>'full_name',
                            split_part(new.email, '@', 1));

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Service role can manage all profiles"
  on public.profiles for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
