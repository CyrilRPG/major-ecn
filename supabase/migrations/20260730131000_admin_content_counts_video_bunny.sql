-- Pastille « Vidéo » de la liste Contenu : une vidéo hébergée sur Bunny n'a pas
-- de `storage_path`, l'item apparaissait donc « Pas de vidéo » alors qu'il en
-- avait une. On compte les deux hébergements, et uniquement les vidéos de
-- COURS (les séances approfondies ont leur propre onglet et un autre public).
create or replace function public.admin_content_counts()
 returns table(cours_id uuid, has_video boolean, has_fiche boolean, qcm_count integer, annale_count integer, flashcard_count integer, importance smallint)
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select c.id,
    exists(
      select 1 from public.videos v
      where v.cours_id = c.id
        and coalesce(v.type, 'cours') = 'cours'
        and (v.storage_path is not null or v.bunny_video_id is not null)
    ),
    exists(select 1 from public.fiches f where f.cours_id = c.id and f.storage_path is not null),
    (select count(*)::int from public.qcm_series s where s.cours_id = c.id and s.type = 'qcm'),
    (select count(*)::int from public.qcm_series s where s.cours_id = c.id and s.type = 'annale'),
    (select count(*)::int from public.flashcards fc where fc.cours_id = c.id),
    c.importance
  from public.cours c
  where public."current_role"() in ('admin','professor');
$function$;
