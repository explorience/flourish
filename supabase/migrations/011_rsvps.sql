-- RSVPs table: people attending without necessarily claiming a need
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  potluck_id uuid not null references public.potlucks(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  guest_name text,
  guest_email text,
  created_at timestamptz not null default now(),
  constraint rsvps_identity_check check (profile_id is not null or guest_name is not null),
  constraint rsvps_unique_profile unique (potluck_id, profile_id),
  constraint rsvps_unique_guest unique (potluck_id, guest_name)
);

create index rsvps_potluck_id_idx on public.rsvps(potluck_id);

-- RLS
alter table public.rsvps enable row level security;

create policy "RSVPs are viewable by everyone"
  on public.rsvps for select using (true);

create policy "Anyone can create RSVPs"
  on public.rsvps for insert with check (true);

create policy "RSVP owners or hosts can delete RSVPs"
  on public.rsvps for delete
  using (
    profile_id = auth.uid() or
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );
