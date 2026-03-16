-- Allow hosts to delete invites for their potlucks
create policy "Hosts can delete invites"
  on public.invites for delete
  using (
    exists (select 1 from public.potlucks where id = potluck_id and host_id = auth.uid())
  );
