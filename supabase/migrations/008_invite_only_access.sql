-- Allow invite_only potlucks to be viewed by users whose email has an invite
create policy "Invited users can view invite-only potlucks"
  on public.potlucks for select
  using (
    access_level = 'invite_only'
    and exists (
      select 1 from public.invites
      where invites.potluck_id = id
        and invites.accepted = true
        and invites.email = (select email from auth.users where auth.users.id = auth.uid())
    )
  );

-- The invite acceptance page uses the service client (bypasses RLS)
-- and passes the invite code as a query parameter so the potluck page
-- can fall back to the service client for non-logged-in users.
