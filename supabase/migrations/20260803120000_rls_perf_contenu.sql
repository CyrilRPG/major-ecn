-- Performance RLS : la page « Contenu » et l'ouverture d'un item étaient
-- devenues inutilisables — 10 s et plus par requête, jusqu'au statement_timeout
-- qui renvoyait une page vide ou un 404 (« impossible d'entrer dans l'item »).
--
-- Cause. Chaque policy de lecture appelait `can_access_faculte(<sous-requête>)`
-- LIGNE PAR LIGNE, et cette sous-requête traversait `cours` → `matieres` →
-- `semestres` — trois tables elles-mêmes protégées par RLS, dont les policies
-- rappelaient `can_access_faculte(<sous-requête>)`. La cascade se répétait sur
-- quatre à cinq niveaux. Mesure avant correctif, pour 174 questions rendues :
-- 429 862 blocs lus, 709 ms de planification, 10 904 ms d'exécution.
--
-- Correctif. Les ensembles autorisés (facultés, collèges, items) sont calculés
-- UNE fois par requête par des fonctions STABLE SECURITY DEFINER — ce qui coupe
-- au passage la récursion RLS sur la hiérarchie — et les policies se réduisent à
-- un test d'appartenance. Les appels sans argument sont enveloppés dans un
-- `(select …)` pour que PostgreSQL les évalue en InitPlan et non par ligne.
--
-- Les droits accordés sont rigoureusement identiques à ceux d'avant, y compris
-- les cas limites : un admin (ou une portée « all » / « college ») voyait les
-- lignes dont la chaîne matière→semestre est cassée, puisque
-- `can_access_faculte(null)` renvoyait `true` pour lui — d'où
-- `access_all_facultes()`, qui rejoue exactement ce court-circuit.

-- ---------------------------------------------------------------------------
-- 1. Périmètre de l'utilisateur courant, calculé une fois
-- ---------------------------------------------------------------------------

-- Vrai quand l'utilisateur voit toutes les facultés sans condition : admin, ou
-- portée « all », ou portée « college » (le filtrage collège/item se fait au
-- niveau applicatif, cf. canAccessCollege / canAccessCours).
create or replace function public.access_all_facultes()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select coalesce(
    (select p.role = 'admin'
         or p.permission_scope->>'type' in ('all', 'college')
       from public.profiles p
      where p.id = auth.uid()),
    false);
$function$;

-- Facultés lisibles. Tableau vide = aucune (utilisateur sans profil, ou portée
-- inconnue) — c'est ce que renvoyait déjà `can_access_faculte`.
create or replace function public.accessible_faculte_ids()
returns text[]
language sql
stable
security definer
set search_path to 'public'
as $function$
  select case
    when public.access_all_facultes()
      then (select coalesce(array_agg(f.id), '{}'::text[]) from public.facultes f)
    else coalesce((
      select array_agg(x)
        from public.profiles p
        -- Le CASE garde `jsonb_array_elements_text` d'un scope mal formé : sur
        -- autre chose qu'un tableau, la fonction lèverait une erreur.
        cross join lateral jsonb_array_elements_text(
          case when jsonb_typeof(p.permission_scope->'faculties') = 'array'
               then p.permission_scope->'faculties'
               else '[]'::jsonb end) x
       where p.id = auth.uid()
         and p.permission_scope->>'type' = 'faculty'
    ), '{}'::text[])
  end;
$function$;

-- Collèges lisibles. SECURITY DEFINER : la lecture de `matieres`/`semestres` se
-- fait ici hors RLS, ce qui interrompt la récursion des policies.
create or replace function public.accessible_matiere_ids()
returns setof text
language sql
stable
security definer
set search_path to 'public'
as $function$
  select m.id
    from public.matieres m
    left join public.semestres s on s.id = m.semestre_id
   where public.access_all_facultes()
      or s.faculte_id = any (public.accessible_faculte_ids());
$function$;

-- Items lisibles.
create or replace function public.accessible_cours_ids()
returns setof uuid
language sql
stable
security definer
set search_path to 'public'
as $function$
  select c.id
    from public.cours c
    left join public.matieres m on m.id = c.matiere_id
    left join public.semestres s on s.id = m.semestre_id
   where public.access_all_facultes()
      or s.faculte_id = any (public.accessible_faculte_ids());
$function$;

grant execute on function public.access_all_facultes() to authenticated, anon;
grant execute on function public.accessible_faculte_ids() to authenticated, anon;
grant execute on function public.accessible_matiere_ids() to authenticated, anon;
grant execute on function public.accessible_cours_ids() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- 2. Policies de lecture de la hiérarchie
-- ---------------------------------------------------------------------------

drop policy if exists semestres_read on public.semestres;
create policy semestres_read on public.semestres
  for select
  using (
    (select public.access_all_facultes())
    -- Le cast force la forme « tableau » de ANY : sans lui, PostgreSQL lit
    -- `= any (<sous-requête>)` et attend des lignes text, pas un text[].
    or faculte_id = any ((select public.accessible_faculte_ids())::text[])
  );

drop policy if exists matieres_read on public.matieres;
create policy matieres_read on public.matieres
  for select
  using (
    (select public.access_all_facultes())
    or id in (select * from public.accessible_matiere_ids())
  );

drop policy if exists cours_read on public.cours;
create policy cours_read on public.cours
  for select
  using (
    (select public.access_all_facultes())
    or matiere_id in (select * from public.accessible_matiere_ids())
  );

-- ---------------------------------------------------------------------------
-- 3. Policies de lecture du contenu porté par un item
-- ---------------------------------------------------------------------------

drop policy if exists videos_read on public.videos;
create policy videos_read on public.videos
  for select
  using (
    (select public.access_all_facultes())
    or cours_id in (select * from public.accessible_cours_ids())
  );

drop policy if exists fiches_read on public.fiches;
create policy fiches_read on public.fiches
  for select
  using (
    (select public.access_all_facultes())
    or cours_id in (select * from public.accessible_cours_ids())
  );

drop policy if exists flashcards_read on public.flashcards;
create policy flashcards_read on public.flashcards
  for select
  using (
    (select public.access_all_facultes())
    or cours_id in (select * from public.accessible_cours_ids())
  );

drop policy if exists cours_content_slots_read on public.cours_content_slots;
create policy cours_content_slots_read on public.cours_content_slots
  for select
  using (
    (select public.access_all_facultes())
    or cours_id in (select * from public.accessible_cours_ids())
  );

drop policy if exists qcm_series_read on public.qcm_series;
create policy qcm_series_read on public.qcm_series
  for select
  using (
    (select public.access_all_facultes())
    or cours_id in (select * from public.accessible_cours_ids())
  );

-- Questions et items : on s'appuie sur la table du dessus, dont la RLS est
-- désormais bon marché. Passer par `qcm_series` plutôt que par une fonction
-- SECURITY DEFINER est délibéré : c'est ce qui conserve la policy RESTRICTIVE
-- `qcm_series_voie_restrict` (interne / externe) dans la chaîne.
drop policy if exists qcm_questions_read on public.qcm_questions;
create policy qcm_questions_read on public.qcm_questions
  for select
  using (exists (
    select 1 from public.qcm_series qs where qs.id = qcm_questions.serie_id
  ));

drop policy if exists qcm_items_read on public.qcm_items;
create policy qcm_items_read on public.qcm_items
  for select
  using (exists (
    select 1 from public.qcm_questions q where q.id = qcm_items.question_id
  ));

-- La restriction par voie appelait `current_role()` et `current_voie()` à chaque
-- ligne de `qcm_series` : même logique, évaluée une fois.
drop policy if exists qcm_series_voie_restrict on public.qcm_series;
create policy qcm_series_voie_restrict on public.qcm_series
  as restrictive
  for select
  using (
    (select public."current_role"()) is distinct from 'student'
    or type is distinct from 'qcm'
    or label ~* 'entra[iî]nement'
    or case (select public.current_voie())
         when 'interne' then coalesce(kind, 'qcm') <> 'qroc'
         when 'externe' then coalesce(kind, 'qcm') = 'qroc'
         else true
       end
  );

-- ---------------------------------------------------------------------------
-- 4. Policies « admin » : un appel par requête au lieu d'un par ligne
-- ---------------------------------------------------------------------------

-- Ces policies sont `for all` : leur `using` entre dans le OR de CHAQUE lecture
-- des tables de contenu (cf. le plan : `can_access_faculte(…) OR current_role()
-- = 'admin'`). Sans le `(select …)`, `current_role()` — donc une lecture de
-- `profiles` — était rejoué à chaque ligne. Seule l'enveloppe change.
do $$
declare
  t text;
begin
  foreach t in array array[
    'facultes', 'semestres', 'matieres', 'cours', 'cours_content_slots',
    'videos', 'fiches', 'flashcards', 'qcm_series', 'qcm_questions', 'qcm_items'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);
    execute format($f$
      create policy %I on public.%I
        for all
        using ((select public."current_role"()) = 'admin')
        with check ((select public."current_role"()) = 'admin')
    $f$, t || '_admin_write', t);
  end loop;
end
$$;

drop policy if exists video_supports_admin on public.video_supports;
create policy video_supports_admin on public.video_supports
  for all to authenticated
  using ((select public."current_role"()) = 'admin')
  with check ((select public."current_role"()) = 'admin');

drop policy if exists video_supports_read on public.video_supports;
create policy video_supports_read on public.video_supports
  for select to authenticated
  using (exists (select 1 from public.videos v where v.id = video_supports.video_id));
