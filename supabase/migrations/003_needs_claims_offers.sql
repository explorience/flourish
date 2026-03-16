-- Needs table
create table public.needs (
  id uuid primary key default gen_random_uuid(),
  potluck_id uuid not null references public.potlucks(id) on delete cascade,
  emoji text not null default '🍽️',
  name text not null,
  quantity integer not null default 1,
  claimed_quantity integer not null default 0,
  point_value integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index needs_potluck_id_idx on public.needs(potluck_id);

-- Claims table
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.needs(id) on delete cascade,
  potluck_id uuid not null references public.potlucks(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  guest_name text,
  guest_email text,
  quantity integer not null default 1,
  verified boolean not null default false,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  constraint claims_identity_check check (profile_id is not null or guest_name is not null)
);

create index claims_potluck_id_idx on public.claims(potluck_id);
create index claims_need_id_idx on public.claims(need_id);

-- Offers table
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  potluck_id uuid not null references public.potlucks(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  guest_name text,
  emoji text not null default '🎁',
  name text not null,
  description text,
  verified boolean not null default false,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  constraint offers_identity_check check (profile_id is not null or guest_name is not null)
);

create index offers_potluck_id_idx on public.offers(potluck_id);

-- RLS for needs
alter table public.needs enable row level security;

create policy "Needs are viewable by everyone with potluck access"
  on public.needs for select using (true);

create policy "Hosts can manage needs"
  on public.needs for insert
  with check (
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

create policy "Hosts can update needs"
  on public.needs for update
  using (
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

create policy "Hosts can delete needs"
  on public.needs for delete
  using (
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

-- RLS for claims
alter table public.claims enable row level security;

create policy "Claims are viewable by everyone with potluck access"
  on public.claims for select using (true);

create policy "Anyone can create claims"
  on public.claims for insert with check (true);

create policy "Claim owners or hosts can delete claims"
  on public.claims for delete
  using (
    profile_id = auth.uid() or
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

create policy "Hosts can update claims (for verification)"
  on public.claims for update
  using (
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

-- RLS for offers
alter table public.offers enable row level security;

create policy "Offers are viewable by everyone with potluck access"
  on public.offers for select using (true);

create policy "Anyone can create offers"
  on public.offers for insert with check (true);

create policy "Offer owners or hosts can delete offers"
  on public.offers for delete
  using (
    profile_id = auth.uid() or
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

create policy "Hosts can update offers (for verification)"
  on public.offers for update
  using (
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );

-- Function to update claimed_quantity on claims changes
create or replace function public.update_claimed_quantity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.needs
    set claimed_quantity = claimed_quantity + new.quantity
    where id = new.need_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.needs
    set claimed_quantity = claimed_quantity - old.quantity
    where id = old.need_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_claim_change
  after insert or delete on public.claims
  for each row execute function public.update_claimed_quantity();
