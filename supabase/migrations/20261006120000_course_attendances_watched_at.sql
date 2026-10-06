-- =============================================
-- Feuilles d'émargement : date et heure du VISIONNAGE
--
-- Depuis le 05/10/2026, les feuilles dues et non signées (bug du plein écran,
-- vidéos vues sans feuille) sont réclamées à la connexion suivante : la
-- signature y est horodatée ce jour-là, parfois des semaines après la séance.
-- L'espace admin doit enregistrer la date de la séance suivie, pas celle de
-- la signature : `watched_at`.
--
--   - feuille née au lecteur (seuil de 20 %) : `watched_at` = `required_at`,
--     posé par défaut à l'insertion (route web comme route mobile) ;
--   - feuille de rattrapage (scripts/rattrapage-emargements-videos.mjs) : le
--     lecteur n'avait rien enregistré, `required_at` est l'heure du script.
--     Seule trace : `course_progress.last_seen_at` (dernière visite de l'item),
--     intacte tant que la feuille n'est pas signée — la signature la remplace.
--     Sans trace antérieure au rattrapage : NULL (« heure non enregistrée »).
-- =============================================

alter table public.course_attendances
  add column if not exists watched_at timestamptz default now();

comment on column public.course_attendances.watched_at is
  'Date et heure du visionnage (seuil de 20 % au lecteur). NULL = feuille de rattrapage sans trace du visionnage. C''est la date enregistrée côté admin, pas signed_at.';

update public.course_attendances
   set watched_at = required_at
 where coalesce(user_agent, '') not like 'rattrapage%';

update public.course_attendances a
   set watched_at = (
     select p.last_seen_at
       from public.course_progress p
      where p.user_id = a.user_id
        and p.cours_id = a.cours_id
        and a.signed_at is null
        and p.last_seen_at < a.required_at
   )
 where coalesce(a.user_agent, '') like 'rattrapage%';
