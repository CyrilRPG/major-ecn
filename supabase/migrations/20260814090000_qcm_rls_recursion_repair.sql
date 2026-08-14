-- ============================================================================
-- URGENCE 2026-08-14 — « 404 non found » dans l'espace professeur
-- ============================================================================
--
-- À APPLIQUER DANS SUPABASE : Dashboard > SQL Editor > coller CE FICHIER > Run.
-- Sans risque à relancer (tout est idempotent).
--
-- Symptôme signalé par Dr Borgne (mission QI/QCM/QROC) : impossible d'ajouter
-- ses propres questions, et « Gérer les QCM » renvoie une page 404.
--
-- Mesure faite en production le 2026-08-14 (compte de test à sa portée exacte) :
-- TOUTE lecture de `qcm_series`, `qcm_questions` ou `qcm_items` via la RLS
-- échoue en 42P17 « infinite recursion detected in policy », pour les trois
-- rôles (élève, professeur, admin). Les pages qui lisent en service-role ne le
-- voyaient pas ; /admin/contenu/[cours] ne testait pas l'erreur et traduisait la
-- ligne vide en `notFound()` → 404, et l'éditeur de questions s'ouvrait vide.
--
-- Cause : la production porte encore la version 20260811120000 de la policy
-- `qcm_series_entrainement_voie_restrict`, qui appelle
-- `qcm_series_default_allowed_voies(id)` — laquelle lit `qcm_questions`, dont la
-- policy `qcm_questions_read` remonte à `qcm_series`. Le cycle est fermé et
-- PostgreSQL refuse la lecture. Le correctif définitif existe déjà
-- (20260811180000) : il n'a jamais été exécuté sur cette base. Ce fichier le
-- ré-applique, sans dépendre du nom des policies déployées à la main.
--
-- Miroir applicatif de ces règles : src/lib/data/qcm-access-rules.ts
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Diagnostic : trace ce qui va être supprimé (visible dans la sortie du SQL
--    Editor). Aucune modification ici.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  n integer := 0;
begin
  for r in
    select policyname, coalesce(qual, '') || coalesce(with_check, '') as expr
      from pg_policies
     where schemaname = 'public'
       and tablename = 'qcm_series'
       and (coalesce(qual, '') || coalesce(with_check, ''))
           similar to '%(qcm_questions|qcm_series_default_allowed_voies)%'
  loop
    n := n + 1;
    raise notice 'Policy récursive détectée sur qcm_series : % → %', r.policyname, left(r.expr, 200);
  end loop;
  if n = 0 then
    raise notice 'Aucune policy récursive sur qcm_series : la base est déjà saine.';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. Rupture du cycle : suppression de TOUTE policy de `qcm_series` qui
--    redescend vers `qcm_questions`, quel que soit son nom.
-- ---------------------------------------------------------------------------
drop policy if exists qcm_series_entrainement_voie_restrict on public.qcm_series;

do $$
declare
  r record;
begin
  for r in
    select policyname
      from pg_policies
     where schemaname = 'public'
       and tablename = 'qcm_series'
       and (coalesce(qual, '') || coalesce(with_check, ''))
           similar to '%(qcm_questions|qcm_series_default_allowed_voies)%'
  loop
    execute format('drop policy if exists %I on public.qcm_series', r.policyname);
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 3. La voie d'un entraînement devient une DONNÉE (`allowed_voies`) au lieu
--    d'un calcul fait à chaque lecture : QCM → interne, QROC → externe, série
--    vide → interne. Ne touche que les lignes non encore renseignées.
-- ---------------------------------------------------------------------------
update public.qcm_series s
   set allowed_voies = case
         when exists (
           select 1 from public.qcm_questions q
            where q.serie_id = s.id and q.format = 'qcm'
         ) then array['interne']::text[]
         when exists (
           select 1 from public.qcm_questions q
            where q.serie_id = s.id and q.format = 'qroc'
         ) then array['externe']::text[]
         else array['interne']::text[]
       end
 where s.allowed_voies is null
   and s.label ~* 'entra[iî]nement';

-- ---------------------------------------------------------------------------
-- 4. Policy rétablie, sans aucune référence à `qcm_questions`.
--    `(select …)` autour des fonctions : une évaluation par requête, pas par
--    ligne (cf. 20260803120000).
-- ---------------------------------------------------------------------------
create policy qcm_series_entrainement_voie_restrict
  on public.qcm_series
  as restrictive for select to public
  using (
    (select public."current_role"()) is distinct from 'student'
    or label !~* 'entra[iî]nement'
    or (
      (allowed_voies is null or (select public.current_voie()) = any(allowed_voies))
      and (allowed_offers is null or allowed_offers && (select public.current_offers()))
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Nouvelles séries « Entraînement » : la voie est fixée à l'insertion de la
--    première question par un trigger, qui s'exécute hors moteur de policies.
-- ---------------------------------------------------------------------------
create or replace function public.qcm_series_sync_entrainement_voie()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.qcm_series s
     set allowed_voies = case
           when new.format = 'qroc' then array['externe']::text[]
           else array['interne']::text[]
         end
   where s.id = new.serie_id
     and s.allowed_voies is null
     and s.label ~* 'entra[iî]nement';
  return new;
end
$$;

drop trigger if exists qcm_questions_set_entrainement_voie on public.qcm_questions;
create trigger qcm_questions_set_entrainement_voie
  after insert on public.qcm_questions
  for each row execute function public.qcm_series_sync_entrainement_voie();

-- ---------------------------------------------------------------------------
-- 6. Retrait de la fonction fautive : tant qu'elle existe, une policy peut la
--    réintroduire dans le cycle.
-- ---------------------------------------------------------------------------
do $$
begin
  drop function if exists public.qcm_series_default_allowed_voies(uuid);
exception when others then
  raise notice 'qcm_series_default_allowed_voies conservée : %', sqlerrm;
end
$$;

-- ---------------------------------------------------------------------------
-- 7. Garde-fou : la migration ÉCHOUE si une arête du cycle subsiste.
-- ---------------------------------------------------------------------------
do $$
declare
  offending text;
begin
  select string_agg(policyname, ', ')
    into offending
    from pg_policies
   where schemaname = 'public'
     and tablename = 'qcm_series'
     and (coalesce(qual, '') || coalesce(with_check, ''))
         similar to '%(qcm_questions|qcm_series_default_allowed_voies)%';
  if offending is not null then
    raise exception
      'Policies de qcm_series référençant qcm_questions (récursion RLS 42P17) : %',
      offending;
  end if;
  raise notice 'OK — plus aucune policy de qcm_series ne référence qcm_questions.';
end
$$;
