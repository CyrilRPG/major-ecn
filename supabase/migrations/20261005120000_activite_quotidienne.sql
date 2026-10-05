-- Accueil — « Votre activité sur les 30 derniers jours » (05/10/2026).
--
-- Un point par journée civile (fuseau `p_tz`, Paris par défaut) sur les
-- `p_jours` derniers jours, aujourd'hui compris. Chaque jour renvoie :
--   s          temps de travail mesuré (platform_time_tracking, battement des
--              pages d'étude, jour UTC — la table ne stocke rien de plus fin),
--              plafonné à 16 h comme la synchronisation mobile ;
--   qcm        questions QCM/QROC répondues (hors dossiers progressifs) ;
--   cas        cas cliniques (dossiers progressifs) travaillés : séries
--              distinctes `kind = 'dp'` ou libellées « DP … » ;
--   fc         flashcards révisées ;
--   transv     révisions transversales terminées ;
--   epreuves   épreuves blanches rendues ;
--   parcours   niveaux du Parcours du Major réalisés ;
--   plan_prevues / plan_faites  séances du planificateur prévues ce jour-là
--              (hors annulées) et terminées — même règle que computeExecution.
-- Aucune durée n'est déduite des compteurs : une activité sans temps mesuré
-- reste à 0 seconde.
--
-- SECURITY DEFINER limité à auth.uid() (comme get_accueil_stats) : agrégats
-- en SQL, aucun plafond PostgREST de 1 000 lignes.

CREATE OR REPLACE FUNCTION public.get_activite_quotidienne(
  p_jours integer DEFAULT 90,
  p_tz text DEFAULT 'Europe/Paris'
)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
with
uid as (select auth.uid() as id),
bornes as (
  select (now() at time zone p_tz)::date as fin,
         (now() at time zone p_tz)::date - (least(greatest(coalesce(p_jours, 90), 1), 366) - 1) as debut
),
-- Borne d'horodatage : minuit local du premier jour.
depuis as (select ((select debut from bornes)::timestamp at time zone p_tz) as ts),
jours as (
  select g::date as d
  from generate_series((select debut from bornes), (select fin from bornes), interval '1 day') g
),
temps as (
  select session_date as d, least(sum(greatest(total_seconds, 0)), 16 * 3600)::int as s
  from platform_time_tracking
  where user_id = (select id from uid) and session_date >= (select debut from bornes)
  group by 1
),
att as (
  select (a.attempted_at at time zone p_tz)::date as d,
         (s.kind = 'dp' or coalesce(s.label, '') ~* '^\s*DP\M') as est_dp,
         s.id as serie_id
  from qcm_attempts a
  join qcm_questions q on q.id = a.question_id
  join qcm_series s on s.id = q.serie_id
  where a.user_id = (select id from uid) and a.attempted_at >= (select ts from depuis)
),
questions as (
  select d,
         count(*) filter (where not est_dp)::int as qcm,
         count(distinct serie_id) filter (where est_dp)::int as cas
  from att group by d
),
cartes as (
  select (reviewed_at at time zone p_tz)::date as d, count(*)::int as n
  from flashcard_reviews
  where user_id = (select id from uid) and reviewed_at >= (select ts from depuis)
  group by 1
),
transversales as (
  select (completed_at at time zone p_tz)::date as d, count(*)::int as n
  from transversal_sessions
  where user_id = (select id from uid) and completed_at >= (select ts from depuis)
  group by 1
),
epreuves as (
  select (submitted_at at time zone p_tz)::date as d, count(*)::int as n
  from mock_exam_submissions
  where user_id = (select id from uid) and submitted_at >= (select ts from depuis)
  group by 1
),
parcours as (
  select (completed_at at time zone p_tz)::date as d, count(*)::int as n
  from major_parcours_completions
  where user_id = (select id from uid) and completed_at >= (select ts from depuis)
  group by 1
),
planning as (
  select day as d,
         count(*) filter (where status <> 'annulee')::int as prevues,
         count(*) filter (where status = 'terminee')::int as faites
  from plan_sessions
  where user_id = (select id from uid)
    and day between (select debut from bornes) and (select fin from bornes)
  group by 1
)
select coalesce(jsonb_agg(jsonb_build_object(
  'd', to_char(j.d, 'YYYY-MM-DD'),
  's', coalesce(t.s, 0),
  'qcm', coalesce(q.qcm, 0),
  'cas', coalesce(q.cas, 0),
  'fc', coalesce(c.n, 0),
  'transv', coalesce(tr.n, 0),
  'epreuves', coalesce(e.n, 0),
  'parcours', coalesce(p.n, 0),
  'plan_prevues', coalesce(pl.prevues, 0),
  'plan_faites', coalesce(pl.faites, 0)
) order by j.d), '[]'::jsonb)
from jours j
left join temps t on t.d = j.d
left join questions q on q.d = j.d
left join cartes c on c.d = j.d
left join transversales tr on tr.d = j.d
left join epreuves e on e.d = j.d
left join parcours p on p.d = j.d
left join planning pl on pl.d = j.d;
$function$;

REVOKE ALL ON FUNCTION public.get_activite_quotidienne(integer, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_activite_quotidienne(integer, text) TO authenticated, service_role;
