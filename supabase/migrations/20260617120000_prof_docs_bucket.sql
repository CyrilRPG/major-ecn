-- =============================================================================
-- Migration : bucket privé `prof-docs` pour les documents des professeurs
--             (CV, certificat de scolarité, carte pro). Téléversés directement
--             depuis le site. Chaque professeur gère SON dossier (préfixe = uid)
--             ; l'admin a accès à tout.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('prof-docs', 'prof-docs', false)
on conflict (id) do nothing;

-- Lecture : propriétaire (1er segment du chemin = son uid) OU admin.
create policy "prof_docs_read" on storage.objects for select to authenticated
  using (
    bucket_id = 'prof-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'admin')
  );

create policy "prof_docs_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'prof-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'admin')
  );

create policy "prof_docs_update" on storage.objects for update to authenticated
  using (
    bucket_id = 'prof-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'admin')
  )
  with check (
    bucket_id = 'prof-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'admin')
  );

create policy "prof_docs_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'prof-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'admin')
  );
