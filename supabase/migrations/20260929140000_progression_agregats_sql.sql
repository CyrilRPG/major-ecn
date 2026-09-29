-- Audit de lenteur (29/09/2026) — progression des items calculée en SQL.
--
-- Constat (pg_stat_statements, 22 → 29/09/2026, 91 600 s de base au total) :
--   1. la lecture des « lots de questions » de la faculté (course-progress-data,
--      `lireLotsFaculte`) : 41 600 s, 18 500 appels à 2,2 s de moyenne, 6,7 s
--      au pire. Elle lisait ~20 000 séries en tranches PAR OFFSET, chacune avec
--      `qcm_questions(count)` et la chaîne cours → matieres → semestres jointe
--      ligne à ligne : la tranche k recalculait les k × 1 000 précédentes.
--      Même mise en cache une heure, elle repartait ~1 000 fois par semaine
--      (instances froides, déploiements) — 45 % du temps de la base ;
--   2. les tentatives de l'élève (`chargerSeriesFaites`) : 17 000 s, relues
--      par tranches séquentielles à CHAQUE page élève (le navigateur) ;
--   3. ses flashcards revues (`chargerCoursAvecFlashcardsFaites`) : 9 200 s.
--
-- Correctif : trois agrégats SQL qui renvoient un seul `jsonb` (un scalaire
-- n'est pas plafonné à 1 000 lignes par PostgREST, et un seul aller-retour).
-- Le résultat est exactement ce que le TypeScript reconstruisait ; les règles
-- d'accès (voie, formule, bonus Gériatrie) restent rejouées en TypeScript.
--
-- Accès : service_role SEULEMENT — deux fonctions prennent un user_id en
-- paramètre et liraient l'activité de n'importe quel élève.

-- 1. Lots de questions d'une faculté : une ligne par (cours, classe d'accès),
--    avec le nombre de questions. La classe d'accès reprend `cleLot` de
--    course-progress-data.ts : type, kind, les quatre motifs de libellé testés
--    par `canStudentReadSerie`, allowed_voies, allowed_offers, mg_series,
--    is_revisions. Le libellé renvoyé est un représentant du lot (il porte les
--    mêmes motifs, donc la même décision d'accès).
create or replace function public.progression_lots_questions(p_faculte_id text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  with n_par_serie as (
    select q.serie_id, count(*)::int as n
    from qcm_questions q
    group by q.serie_id
  ),
  series as (
    select
      s.cours_id, c.matiere_id, coalesce(s.label, '') as label, s.type, s.kind,
      s.allowed_voies, s.allowed_offers, s.mg_series, s.is_revisions, n.n,
      coalesce(s.label, '') ~* 'entra[iî]nement' as m_entrainement,
      coalesce(s.label, '') ~* '^dp' as m_dp,
      coalesce(s.label, '') ~* 'g[eé]riatrie' as m_geriatrie,
      coalesce(s.label, '') ~* '^annales?\y' as m_annale
    from qcm_series s
    join n_par_serie n on n.serie_id = s.id
    join cours c on c.id = s.cours_id
    join matieres m on m.id = c.matiere_id
    join semestres se on se.id = m.semestre_id
    where se.faculte_id = p_faculte_id
      and s.type in ('qcm', 'qroc')
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'cours_id', l.cours_id, 'matiere_id', l.matiere_id, 'n', l.n,
    'label', l.label, 'type', l.type, 'kind', l.kind,
    'allowed_voies', l.allowed_voies, 'allowed_offers', l.allowed_offers,
    'mg_series', l.mg_series, 'is_revisions', l.is_revisions
  )), '[]'::jsonb)
  from (
    select cours_id, matiere_id, min(label) as label, type, kind,
      allowed_voies, allowed_offers, mg_series, is_revisions, sum(n)::int as n
    from series
    group by cours_id, matiere_id, type, kind, m_entrainement, m_dp, m_geriatrie, m_annale,
      allowed_voies, allowed_offers, mg_series, is_revisions
  ) l;
$function$;

-- 2. Séries tentées par un élève, avec ses questions DISTINCTES faites.
create or replace function public.progression_series_faites(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id, 'cours_id', s.cours_id, 'matiere_id', c.matiere_id, 'n', f.n,
    'label', coalesce(s.label, ''), 'type', s.type, 'kind', s.kind,
    'allowed_voies', s.allowed_voies, 'allowed_offers', s.allowed_offers,
    'mg_series', s.mg_series, 'is_revisions', s.is_revisions
  )), '[]'::jsonb)
  from (
    select q.serie_id, count(distinct a.question_id)::int as n
    from qcm_attempts a
    join qcm_questions q on q.id = a.question_id
    where a.user_id = p_user_id
    group by q.serie_id
  ) f
  join qcm_series s on s.id = f.serie_id
  join cours c on c.id = s.cours_id;
$function$;

-- 3. Cours dont l'élève a revu au moins une flashcard.
create or replace function public.progression_cours_flashcards_faites(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(distinct f.cours_id), '[]'::jsonb)
  from flashcard_reviews r
  join flashcards f on f.id = r.flashcard_id
  where r.user_id = p_user_id
    and f.cours_id is not null;
$function$;

revoke all on function public.progression_lots_questions(text) from public, anon, authenticated;
revoke all on function public.progression_series_faites(uuid) from public, anon, authenticated;
revoke all on function public.progression_cours_flashcards_faites(uuid) from public, anon, authenticated;
grant execute on function public.progression_lots_questions(text) to service_role;
grant execute on function public.progression_series_faites(uuid) to service_role;
grant execute on function public.progression_cours_flashcards_faites(uuid) to service_role;

-- 4. Contenus présents par item (navigateur et palette de commandes) : items
--    ayant une fiche PDF, une vidéo-fichier, une série QCM, des flashcards.
--    Le navigateur les lisait à CHAQUE page élève par quatre requêtes
--    `.in('cours_id', <1 300 ids>)`, chacune tronquée à 1 000 lignes.
--    Identique pour tous : l'appelant le met en cache global.
create or replace function public.navigator_contenus_cours(p_faculte_id text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  with items as (
    select c.id
    from cours c
    join matieres m on m.id = c.matiere_id
    join semestres se on se.id = m.semestre_id
    where se.faculte_id = p_faculte_id
  )
  select jsonb_build_object(
    'fiche', coalesce((select jsonb_agg(i.id) from items i where exists (select 1 from fiches f where f.cours_id = i.id and f.storage_path is not null)), '[]'::jsonb),
    'video', coalesce((select jsonb_agg(i.id) from items i where exists (select 1 from videos v where v.cours_id = i.id and v.storage_path is not null)), '[]'::jsonb),
    'qcm', coalesce((select jsonb_agg(i.id) from items i where exists (select 1 from qcm_series s where s.cours_id = i.id and s.type = 'qcm')), '[]'::jsonb),
    'flashcards', coalesce((select jsonb_agg(i.id) from items i where exists (select 1 from flashcards f where f.cours_id = i.id)), '[]'::jsonb)
  );
$function$;

revoke all on function public.navigator_contenus_cours(text) from public, anon, authenticated;
grant execute on function public.navigator_contenus_cours(text) to service_role;

-- 5. Tentatives d'un élève avec le cours et le collège de chaque question
--    (`loadStudentAttempts`, maintien-core — web ET app mobile). Lues jusqu'ici
--    par tranches OFFSET avec cinq jointures imbriquées ligne à ligne : 7 600
--    appels à 443 ms de moyenne (5,6 s au pire), plusieurs tranches
--    séquentielles à l'accueil d'un élève assidu.
--    SECURITY INVOKER : la RLS s'applique comme avec PostgREST (un élève ne
--    lit que ses tentatives, et seulement sur les questions qu'il peut voir).
create or replace function public.tentatives_eleve_detail(p_user_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(jsonb_build_object(
    'question_id', a.question_id, 'is_correct', a.is_correct, 'attempted_at', a.attempted_at,
    'cours_id', s.cours_id, 'matiere_id', c.matiere_id, 'matiere_nom', m.nom, 'faculte_id', se.faculte_id
  ) order by a.attempted_at, a.id), '[]'::jsonb)
  from qcm_attempts a
  join qcm_questions q on q.id = a.question_id
  join qcm_series s on s.id = q.serie_id
  join cours c on c.id = s.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where a.user_id = p_user_id;
$function$;

revoke all on function public.tentatives_eleve_detail(uuid) from public, anon;
grant execute on function public.tentatives_eleve_detail(uuid) to authenticated, service_role;

-- 6. RLS de qcm_series : `current_role()` et `current_is_geriatrie()` évalués
--    UNE fois par requête au lieu d'une fois par ligne. Les deux policies
--    Gériatrie les appelaient nus : Postgres les réévaluait pour chaque série
--    examinée, et chaque appel relit `profiles` (fonctions SECURITY DEFINER,
--    jamais mises en ligne). Enveloppés dans `(select …)`, ils deviennent un
--    InitPlan calculé une fois. Même expression, même résultat — vérifié le
--    29/09/2026 par empreinte des séries ET questions visibles de 4 élèves
--    (Gériatrie ×2, MG, tous collèges), identique avant/après.
--    Mesuré sous l'identité d'un élève : séries 1 016 → 86 ms, questions
--    1 070 → 131 ms, tentatives détaillées 1 018 → 520 ms. La policy de
--    `qcm_questions` passe par `qcm_series` : toute lecture élève en profite.
alter policy qcm_series_geriatrie_mg_block_dp_entrainement_seance on public.qcm_series using (
  ((select "current_role"()) is distinct from 'student'::text)
  or (not (select current_is_geriatrie()))
  or (not (exists (select 1 from cours c join matieres m on m.id = c.matiere_id
                   where c.id = qcm_series.cours_id
                     and (m.id = 'col-medecine-generale'::text or m.parent_matiere_id = 'col-medecine-generale'::text))))
  or ((type is distinct from 'seance'::text) and (label !~* 'entra[iî]nement'::text) and ((label !~* '^dp'::text) or (label ~* 'g[eé]riatrie'::text)))
);
alter policy qcm_series_geriatrie_only_mg_dp on public.qcm_series using (
  ((select "current_role"()) is distinct from 'student'::text)
  or (not mg_series)
  or (label !~* 'g[eé]riatrie'::text)
  or (select current_is_geriatrie())
);
