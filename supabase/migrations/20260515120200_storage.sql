-- Storage buckets + policies
insert into storage.buckets (id, name, public) values
  ('videos','videos',false),
  ('fiches','fiches',false),
  ('assets','assets',true)
on conflict (id) do nothing;

create policy "storage_videos_admin_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.current_role() = 'admin');
create policy "storage_videos_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'videos' and public.current_role() = 'admin')
  with check (bucket_id = 'videos' and public.current_role() = 'admin');
create policy "storage_videos_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.current_role() = 'admin');
create policy "storage_videos_auth_read" on storage.objects for select to authenticated
  using (bucket_id = 'videos');

create policy "storage_fiches_admin_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'fiches' and public.current_role() = 'admin');
create policy "storage_fiches_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'fiches' and public.current_role() = 'admin')
  with check (bucket_id = 'fiches' and public.current_role() = 'admin');
create policy "storage_fiches_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'fiches' and public.current_role() = 'admin');
create policy "storage_fiches_auth_read" on storage.objects for select to authenticated
  using (bucket_id = 'fiches');

create policy "storage_assets_public_read" on storage.objects for select to public using (bucket_id = 'assets');
create policy "storage_assets_admin_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'assets' and public.current_role() = 'admin');
create policy "storage_assets_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'assets' and public.current_role() = 'admin')
  with check (bucket_id = 'assets' and public.current_role() = 'admin');
create policy "storage_assets_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'assets' and public.current_role() = 'admin');
