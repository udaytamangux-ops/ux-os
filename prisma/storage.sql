-- Supabase Storage buckets + owner-only RLS.
-- Files are stored at path: {userId}/{projectId}/{fileId}.{ext}
-- so the first path segment is the owner's auth.uid().
-- Idempotent: safe to run repeatedly.

insert into storage.buckets (id, name, public) values
  ('prompt-images','prompt-images', false),
  ('wireframes','wireframes', false),
  ('ui-screens','ui-screens', false)
on conflict (id) do nothing;

-- Owner-only access per bucket (first folder segment = user id) -------------
drop policy if exists "own prompt-images" on storage.objects;
create policy "own prompt-images" on storage.objects for all
  using (bucket_id = 'prompt-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'prompt-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "own wireframes" on storage.objects;
create policy "own wireframes" on storage.objects for all
  using (bucket_id = 'wireframes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'wireframes' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "own ui-screens" on storage.objects;
create policy "own ui-screens" on storage.objects for all
  using (bucket_id = 'ui-screens' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'ui-screens' and (storage.foldername(name))[1] = auth.uid()::text);
