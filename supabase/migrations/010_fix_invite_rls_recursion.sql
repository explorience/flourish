-- Drop the policy that causes infinite recursion
-- (invites RLS references potlucks, and this potlucks policy references invites)
drop policy if exists "Invited users can view invite-only potlucks" on public.potlucks;

-- Create a security definer function to check invite access without RLS recursion
create or replace function public.has_accepted_invite(p_potluck_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.invites
    where potluck_id = p_potluck_id
      and accepted = true
      and email = (select email from auth.users where id = auth.uid())
  );
$$;

-- Re-create the policy using the security definer function
create policy "Invited users can view invite-only potlucks"
  on public.potlucks for select
  using (
    access_level = 'invite_only'
    and public.has_accepted_invite(id)
  );
