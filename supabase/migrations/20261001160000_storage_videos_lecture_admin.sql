-- Bucket privé `videos` : la lecture n'est plus ouverte à tout compte connecté.
--
-- `storage_videos_auth_read` (20260515120200_storage.sql) autorisait le SELECT
-- de storage.objects sur tout le bucket pour `authenticated` : n'importe quel
-- élève pouvait lister les fichiers et en signer l'URL (createSignedUrl avec
-- son propre jeton), quels que soient sa formule, sa voie ou le déblocage des
-- séances. Latent au 01/10/2026 (aucune vidéo n'a de storage_path, toutes sont
-- sur Bunny), mais le repli Storage restait une porte ouverte.
--
-- Comme le GUID Bunny (20261001150100), l'URL signée se crée désormais au
-- service-role, APRÈS les contrôles d'accès : `signerVideoStockee`
-- (src/lib/videos/source-bunny.ts), appelée par la route video-embed et la page
-- vidéo ; la route mobile download-url signait déjà au service-role.
-- Seuls les admins gardent la lecture directe (téléversement, remplacement,
-- suppression depuis l'administration).
--
-- Prérequis : code déployé qui ne signe plus avec le client utilisateur —
-- major-ecn, mais aussi Major PHA et Major Odontologie, qui partagent ce
-- projet Supabase.

drop policy if exists "storage_videos_auth_read" on storage.objects;
drop policy if exists "storage_videos_admin_read" on storage.objects;

create policy "storage_videos_admin_read" on storage.objects for select to authenticated
  using (bucket_id = 'videos' and (select public.current_role()) = 'admin');

-- Retour arrière :
--   drop policy if exists "storage_videos_admin_read" on storage.objects;
--   create policy "storage_videos_auth_read" on storage.objects for select to authenticated
--     using (bucket_id = 'videos');
