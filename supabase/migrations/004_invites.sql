-- Invites table
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  potluck_id uuid not null references public.potlucks(id) on delete cascade,
  email text not null,
  code text unique not null,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create index invites_potluck_id_idx on public.invites(potluck_id);
create index invites_code_idx on public.invites(code);

-- RLS
alter table public.invites enable row level security;

create policy "Invites are viewable by host"
  on public.invites for select
  using (
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

create policy "Anyone can read invites by code (for validation)"
  on public.invites for select
  using (true);

create policy "Hosts can create invites"
  on public.invites for insert
  with check (
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

create policy "Invites can be updated (accepted)"
  on public.invites for update
  using (true);
