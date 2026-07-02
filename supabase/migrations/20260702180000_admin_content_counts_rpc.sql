-- FIX page /admin/contenu vide : la requête embarquait des compteurs via un
-- embed profond (matieres -> cours -> qcm_series[4k] + flashcards[36k]). Sous
-- RLS (rôle authenticated), l'évaluation des policies sur ces dizaines de
-- milliers de lignes dépassait le statement_timeout -> requête annulée ->
-- `data` null -> grille vide.
--
-- Correctif : une fonction agrégée SECURITY DEFINER (réservée au staff) calcule
-- les compteurs par cours en quelques ms via des sous-requêtes indexées, sans
-- explosion de lignes ni surcoût RLS. La page ne lit plus que cours(id, titre).

create or replace function public.admin_content_counts()
returns table(cours_id uuid, has_video boolean, has_fiche boolean,
  qcm_count int, annale_count int, flashcard_count int, importance smallint)
language sql stable security definer set search_path to 'public' as $$
  select c.id,
    exists(select 1 from public.videos v where v.cours_id = c.id and v.storage_path is not null),
    exists(select 1 from public.fiches f where f.cours_id = c.id and f.storage_path is not null),
    (select count(*)::int from public.qcm_series s where s.cours_id = c.id and s.type = 'qcm'),
    (select count(*)::int from public.qcm_series s where s.cours_id = c.id and s.type = 'annale'),
    (select count(*)::int from public.flashcards fc where fc.cours_id = c.id),
    c.importance
  from public.cours c
  where public."current_role"() in ('admin','professor');
$$;
revoke all on function public.admin_content_counts() from public, anon;
grant execute on function public.admin_content_counts() to authenticated;
