-- Function for atomically incrementing profile points
create or replace function public.increment_points(user_id uuid, amount integer)
returns void as $$
begin
  update public.profiles
  set total_points = total_points + amount
  where id = user_id;
end;
$$ language plpgsql security definer;
