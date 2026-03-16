-- Custom types
create type public.access_level as enum ('invite_only', 'link_shared', 'public');
create type public.potluck_status as enum ('draft', 'active', 'completed', 'archived');

-- Potlucks table
create table public.potlucks (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) <= 100),
  description text not null check (char_length(description) <= 500),
  event_date timestamptz not null,
  location text not null,
  access_level public.access_level not null default 'link_shared',
  open_offers boolean not null default true,
  points_enabled boolean not null default false,
  banner_url text,
  slug text unique not null,
  status public.potluck_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index potlucks_slug_idx on public.potlucks(slug);
create index potlucks_host_id_idx on public.potlucks(host_id);
create index potlucks_status_access_idx on public.potlucks(status, access_level);

create trigger potlucks_updated_at
  before update on public.potlucks
  for each row execute function public.update_updated_at();

-- RLS
alter table public.potlucks enable row level security;

create policy "Public potlucks are viewable by everyone"
  on public.potlucks for select
  using (access_level = 'public' or host_id = auth.uid());

create policy "Link-shared potlucks are viewable by everyone"
  on public.potlucks for select
  using (access_level = 'link_shared');

create policy "Authenticated users can create potlucks"
  on public.potlucks for insert
  with check (auth.uid() = host_id);

create policy "Hosts can update their potlucks"
  on public.potlucks for update
  using (auth.uid() = host_id);

create policy "Hosts can delete their potlucks"
  on public.potlucks for delete
  using (auth.uid() = host_id);
