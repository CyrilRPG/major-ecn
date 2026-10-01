-- Étape 2/2 : `videos.bunny_video_id` n'est plus lisible par anon/authenticated.
--
-- La policy `videos_read` ouvre toutes les lignes des items accessibles : un
-- élève pouvait lire, en interrogeant PostgREST directement, le GUID Bunny de
-- séances qui lui sont fermées (formule Intensive/Approfondie, autre voie,
-- déblocage progressif, onglet vidéo cadenassé des items Découverte). Le GUID
-- suffit à intégrer le lecteur (aucune clé de token Bunny en production).
--
-- Désormais le GUID n'est lu qu'au service-role, APRÈS les contrôles
-- d'accès (`resoudreVideoLecture`, pages vidéo) : src/lib/videos/source-bunny.ts.
-- Les élèves lisent `bunny_disponible` (étape 1).
--
-- Un droit de colonne ne restreint rien tant que le droit de TABLE existe :
-- on retire le SELECT de table puis on accorde les colonnes une à une.
-- ⚠ Toute NOUVELLE colonne de `videos` devra être ajoutée à ce GRANT pour être
-- lisible par les élèves (sinon : « permission denied for table videos »).
-- `select('*')` sur `videos` échoue désormais pour ces rôles.
--
-- Prérequis : code déployé qui ne lit plus `bunny_video_id` avec le client
-- utilisateur — major-ecn, mais aussi Major PHA et Major Odontologie, qui
-- partagent ce projet Supabase.

revoke select on table public.videos from anon, authenticated;

grant select (
  id, cours_id, titre, storage_path, duration_seconds, created_at, type,
  serie_id, unlock_direct, updated_at, order_index, support_path,
  support_pages, support_updated_at, voies, offers, denied_user_ids,
  allowed_user_ids, rubrique, status, publish_at, created_by, published_by,
  published_at, live_at, bunny_disponible
) on public.videos to anon, authenticated;

-- Retour arrière (si un client oublié casse) :
--   grant select on table public.videos to anon, authenticated;
