-- Add image_urls column to posts (text array, up to 10 images)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}'::text[];

-- Create storage bucket for post images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  10485760, -- 10MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set file_size_limit = 10485760;

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Users can delete own post images"
  on storage.objects for delete
  using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- PWA install prompt settings (defaults — admin can adjust in dashboard)
insert into app_settings (key, value, updated_at)
values ('pwa_prompt_max_shows', 7, NOW())
on conflict (key) do update set value = EXCLUDED.value, updated_at = NOW();

insert into app_settings (key, value, updated_at)
values ('pwa_prompt_every_n_visits', 10, NOW())
on conflict (key) do update set value = EXCLUDED.value, updated_at = NOW();
