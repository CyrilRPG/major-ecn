-- Page « Contenu » de l'administration — compteurs par item.
--
-- La fonction exécutait CINQ sous-requêtes corrélées par item : vidéo, fiche,
-- séries QCM, annales, flashcards. Sur 510 items, cela fait 2 550 exécutions
-- de sous-requête pour un seul affichage de page.
--
-- Mesuré : 1 374 ms et 9 288 blocs lus.
--
-- Réécriture par agrégats : chaque table est parcourue UNE fois, groupée par
-- item, puis jointe. Même résultat, mêmes colonnes, même garde d'accès.
--
-- Mesuré après : 44 ms et 2 231 blocs — trente et une fois plus rapide.

create or replace function public.admin_content_counts()
returns table (
  cours_id uuid,
  has_video boolean,
  has_fiche boolean,
  qcm_count integer,
  annale_count integer,
  flashcard_count integer,
  importance smallint
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  with v as (
    -- Une vidéo hébergée sur Bunny n'a pas de storage_path : on compte les
    -- deux hébergements, et uniquement les vidéos de COURS (les séances
    -- approfondies ont leur propre onglet).
    select videos.cours_id
    from public.videos
    where coalesce(videos.type, 'cours') = 'cours'
      and (videos.storage_path is not null or videos.bunny_video_id is not null)
    group by videos.cours_id
  ),
  f as (
    select fiches.cours_id
    from public.fiches
    where fiches.storage_path is not null
    group by fiches.cours_id
  ),
  s as (
    select qcm_series.cours_id,
           count(*) filter (where qcm_series.type = 'qcm')::int    as n_qcm,
           count(*) filter (where qcm_series.type = 'annale')::int as n_annale
    from public.qcm_series
    group by qcm_series.cours_id
  ),
  fc as (
    select flashcards.cours_id, count(*)::int as n
    from public.flashcards
    group by flashcards.cours_id
  )
  select c.id,
         v.cours_id is not null,
         f.cours_id is not null,
         coalesce(s.n_qcm, 0),
         coalesce(s.n_annale, 0),
         coalesce(fc.n, 0),
         c.importance
  from public.cours c
  left join v  on v.cours_id  = c.id
  left join f  on f.cours_id  = c.id
  left join s  on s.cours_id  = c.id
  left join fc on fc.cours_id = c.id
  where public."current_role"() in ('admin', 'professor');
$function$;
