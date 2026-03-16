-- Create storage bucket for banner images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banners',
  'banners',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Allow authenticated users to upload banners
create policy "Authenticated users can upload banners"
  on storage.objects for insert
  with check (bucket_id = 'banners' and auth.role() = 'authenticated');

-- Allow public read access to banners
create policy "Banners are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'banners');

-- Allow owners to delete their banners
create policy "Users can delete own banners"
  on storage.objects for delete
  using (bucket_id = 'banners' and auth.uid()::text = (storage.foldername(name))[1]);
