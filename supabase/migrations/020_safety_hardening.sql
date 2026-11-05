-- ============================================================================
-- 020_safety_hardening.sql
--
-- Tightens Row Level Security before the relaunch. Idempotent: safe to re-run.
-- All server routes that need elevated access use the service_role key, which
-- bypasses RLS, so these changes only affect direct anon/authenticated access
-- (i.e. anyone holding the public anon key).
--
-- Run in the Supabase SQL editor. Review the "NOTE" comments first.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 0. Helpers
-- ---------------------------------------------------------------------------

-- Is the current JWT user a moderator/admin? (security definer so it can read
-- the locked-down moderators table without granting access to it.)
create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.moderators m
    where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_moderator() from public;
grant execute on function public.is_moderator() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 1. Moderators / moderation log
--    The old "Service role full access" policies were USING (true) for every
--    role, so anyone with the anon key could read the list or add themselves
--    as an admin. service_role bypasses RLS and needs no policy.
-- ---------------------------------------------------------------------------
drop policy if exists "Service role full access on moderators" on public.moderators;
drop policy if exists "Service role full access on moderation_log" on public.moderation_log;

-- Signed-in users may see only their own moderator row (header admin link).
drop policy if exists "Moderators can read own row" on public.moderators;
create policy "Moderators can read own row" on public.moderators
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ---------------------------------------------------------------------------
-- 2. SMS tables (phone numbers + full conversation logs)
--    Were FOR ALL USING (true): world-readable and writable. Service role only.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.sms_users') is not null then
    execute 'drop policy if exists "sms_users_all" on public.sms_users';
    execute 'alter table public.sms_users enable row level security';
    execute 'revoke all on public.sms_users from anon, authenticated';
  end if;
  if to_regclass('public.sms_sessions') is not null then
    execute 'drop policy if exists "sms_sessions_all" on public.sms_sessions';
    execute 'alter table public.sms_sessions enable row level security';
    execute 'revoke all on public.sms_sessions from anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Blocks and reports (new)
-- ---------------------------------------------------------------------------
create table if not exists public.user_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.user_blocks enable row level security;

drop policy if exists "Users see own blocks" on public.user_blocks;
create policy "Users see own blocks" on public.user_blocks
  for select to authenticated using (auth.uid() = blocker_id);
drop policy if exists "Users create own blocks" on public.user_blocks;
create policy "Users create own blocks" on public.user_blocks
  for insert to authenticated with check (auth.uid() = blocker_id);
drop policy if exists "Users remove own blocks" on public.user_blocks;
create policy "Users remove own blocks" on public.user_blocks
  for delete to authenticated using (auth.uid() = blocker_id);

create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;
revoke all on function public.is_blocked_between(uuid, uuid) from public;
grant execute on function public.is_blocked_between(uuid, uuid) to authenticated, service_role;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('post', 'user', 'message', 'response')),
  target_id uuid not null,
  reason text check (char_length(reason) <= 2000),
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
-- No policies: written by /api/report with the service role, read by admins.
create index if not exists idx_reports_status on public.reports(status, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. Posts
-- ---------------------------------------------------------------------------

-- 4a. Move SMS posters' phone numbers out of the world-readable posts table.
create table if not exists public.post_sms_contacts (
  post_id uuid primary key references public.posts(id) on delete cascade,
  phone text not null,
  created_at timestamptz not null default now()
);
alter table public.post_sms_contacts enable row level security;
revoke all on public.post_sms_contacts from anon, authenticated;

insert into public.post_sms_contacts (post_id, phone)
select id, source_phone from public.posts
where source_phone is not null
on conflict (post_id) do nothing;

update public.posts set source_phone = null where source_phone is not null;

-- 4b. Allow the 'archived' status used by /api/posts/[id]/archive.
alter table public.posts drop constraint if exists posts_status_check;
alter table public.posts add constraint posts_status_check
  check (status in ('active', 'fulfilled', 'expired', 'archived'));

-- 4c. Insert: only as yourself. (Web posts are created by /api/posts with the
--     service role; this just stops forged user_id / unmoderated direct inserts.)
drop policy if exists "Anyone can create posts" on public.posts;
drop policy if exists "Users can create own posts" on public.posts;
create policy "Users can create own posts" on public.posts
  for insert to authenticated
  with check (auth.uid() = user_id);

-- 4d. Update: owner only. Previously anon posts (user_id null: all SMS posts,
--     and posts of deleted accounts) could be edited by anyone.
drop policy if exists "Anyone can update posts" on public.posts;
drop policy if exists "Users can update own posts or anon posts" on public.posts;
drop policy if exists "Users can update own posts" on public.posts;
create policy "Users can update own posts" on public.posts
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4e. Select: hide rejected/pending posts from the public (still visible to the
--     author and to moderators).
drop policy if exists "Posts are viewable by everyone" on public.posts;
drop policy if exists "Approved posts are viewable by everyone" on public.posts;
create policy "Approved posts are viewable by everyone" on public.posts
  for select
  using (
    coalesce(moderation_status, 'approved') = 'approved'
    or auth.uid() = user_id
    or public.is_moderator()
  );

-- 4f. Owners can't change authorship / moderation / SMS fields directly.
create or replace function public.posts_protect_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.user_id           := old.user_id;
    new.moderation_status := old.moderation_status;
    new.moderated_at      := old.moderated_at;
    new.moderated_by      := old.moderated_by;
    new.rejection_reason  := old.rejection_reason;
    new.source            := old.source;
    new.source_phone      := old.source_phone;
  end if;
  return new;
end;
$$;
drop trigger if exists posts_protect_columns on public.posts;
create trigger posts_protect_columns
  before update on public.posts
  for each row execute function public.posts_protect_columns();

-- ---------------------------------------------------------------------------
-- 5. Responses
-- ---------------------------------------------------------------------------
drop policy if exists "Anyone can create responses" on public.responses;
drop policy if exists "Users can respond as themselves" on public.responses;
create policy "Users can respond as themselves" on public.responses
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Responders or post owners can delete responses" on public.responses;
create policy "Responders or post owners can delete responses" on public.responses
  for delete to authenticated
  using (
    auth.uid() = user_id
    or exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );

-- Simple DB-level spam brake: max 20 responses per user per hour.
create or replace function public.responses_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') and new.user_id is not null then
    if (select count(*) from public.responses
        where user_id = new.user_id and created_at > now() - interval '1 hour') >= 20 then
      raise exception 'Too many responses, please try again later' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists responses_rate_limit on public.responses;
create trigger responses_rate_limit
  before insert on public.responses
  for each row execute function public.responses_rate_limit();

-- ---------------------------------------------------------------------------
-- 6. Threads / messages
-- ---------------------------------------------------------------------------
-- Old insert policy only checked poster_id = auth.uid(), so anyone could open
-- a DM thread with any user about any post.
drop policy if exists "Poster can create threads" on public.threads;
create policy "Poster can create threads" on public.threads
  for insert to authenticated
  with check (
    auth.uid() = poster_id
    and exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
    and exists (select 1 from public.responses r where r.post_id = threads.post_id and r.user_id = threads.responder_id)
    and not public.is_blocked_between(poster_id, responder_id)
  );

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages" on public.messages
  for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.threads t
      where t.id = messages.thread_id
        and (t.poster_id = auth.uid() or t.responder_id = auth.uid())
        and not public.is_blocked_between(t.poster_id, t.responder_id)
    )
  );

-- Old update policy let either participant rewrite any message's content.
-- Now: only the recipient, and only the `read` flag.
drop policy if exists "Participants can mark messages read" on public.messages;
create policy "Participants can mark messages read" on public.messages
  for update to authenticated
  using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.threads t
      where t.id = messages.thread_id
        and (t.poster_id = auth.uid() or t.responder_id = auth.uid())
    )
  );
revoke update on public.messages from anon, authenticated;
grant update (read) on public.messages to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Profiles: users can't self-promote their vouch status / counters
-- ---------------------------------------------------------------------------
create or replace function public.profiles_protect_columns()
returns trigger
language plpgsql
as $$
declare
  protected text[] := array['vouch_status', 'vouch_count', 'total_points'];
  keep jsonb;
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into keep
    from jsonb_each(to_jsonb(old)) where key = any(protected);
  else
    select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into keep
    from jsonb_each(jsonb_build_object('vouch_status', 'unvouched', 'vouch_count', 0, 'total_points', 0))
    where to_jsonb(new) ? key;
  end if;
  new := jsonb_populate_record(new, keep);
  return new;
end;
$$;
drop trigger if exists profiles_protect_columns on public.profiles;
create trigger profiles_protect_columns
  before insert or update on public.profiles
  for each row execute function public.profiles_protect_columns();

-- Security-definer counters must not be callable by clients.
do $$
begin
  if to_regprocedure('public.increment_points(uuid, integer)') is not null then
    execute 'revoke execute on function public.increment_points(uuid, integer) from public, anon, authenticated';
  end if;
  if to_regprocedure('public.increment_vouch_count(uuid)') is not null then
    execute 'revoke execute on function public.increment_vouch_count(uuid) from public, anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 8. Vouching
-- ---------------------------------------------------------------------------
-- Invite codes were world-readable: anyone could list and redeem them.
drop policy if exists "Anyone can read invites" on public.vouch_invites;
drop policy if exists "Creators can read own invites" on public.vouch_invites;
create policy "Creators can read own invites" on public.vouch_invites
  for select to authenticated using (auth.uid() = voucher_id);

-- Creators could raise max_uses/expiry arbitrarily; redemption uses service role.
drop policy if exists "Creators can update invites" on public.vouch_invites;

-- Direct vouch inserts must come from a vouched member (matches /api/vouch).
drop policy if exists "Authenticated users can vouch" on public.vouches;
create policy "Authenticated users can vouch" on public.vouches
  for insert to authenticated
  with check (
    auth.uid() = voucher_id
    and voucher_id <> vouchee_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.vouch_status <> 'unvouched')
  );

-- ---------------------------------------------------------------------------
-- 9. Storage: uploads only into your own folder (<uid>/...)
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can upload post images" on storage.objects;
create policy "Authenticated users can upload post images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Reject SVG and anything that is not a raster image, and cap size, at the bucket level.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    file_size_limit = least(coalesce(file_size_limit, 5242880), 5242880)
where id = 'post-images';

commit;
