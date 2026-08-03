-- Deuxième volet de l'audit de vitesse (le premier : 20260803120000).
--
-- Même défaut que pour `can_access_faculte`, mais sur les tables de progression
-- de l'élève : `auth.uid()` et `current_role()` étaient appelés une fois PAR
-- LIGNE examinée. `current_role()` lit `profiles` à chaque appel — donc une
-- requête par ligne. Mesures relevées avant correctif (pg_stat_statements) :
--
--   qcm_attempts + embed questions/séries : 45 338 appels, 218 ms de moyenne,
--                                           2 h 45 de temps serveur cumulé
--   flashcard_reviews + embed flashcards  : 45 620 appels,  53 ms de moyenne
--
-- Correctif : envelopper l'appel dans un `(select …)`. PostgreSQL le remonte
-- alors en InitPlan, évalué UNE fois par requête. C'est l'optimisation
-- recommandée par Supabase (« Call functions with select »). La condition
-- logique est identique — seule l'enveloppe change, aucun droit n'est modifié.
--
-- La réécriture est faite en balayant `pg_policies` : elle couvre d'un coup
-- toutes les policies du schéma, y compris celles qui ne sont pas encore dans
-- un chemin chaud aujourd'hui. L'état d'origine est copié dans une table de
-- sauvegarde avant toute modification, pour pouvoir revenir en arrière.

-- Sauvegarde de l'état d'origine (source de vérité pour un éventuel rollback).
create table if not exists public._rls_policy_backup_20260803 as
select * from pg_policies where schemaname = 'public';

-- Elle décrit le modèle de sécurité : personne ne doit la lire via l'API.
-- RLS activée sans aucune policy = tout refusé, plus les droits révoqués.
alter table public._rls_policy_backup_20260803 enable row level security;
revoke all on public._rls_policy_backup_20260803 from anon, authenticated;

do $$
declare
  r record;
  v_qual text;
  v_check text;
  v_sql text;
begin
  -- On matérialise la liste AVANT de toucher aux catalogues : itérer
  -- directement sur pg_policies pendant qu'on le modifie est fragile.
  create temp table _policies_a_reecrire on commit drop as
  select schemaname, tablename, policyname, permissive, cmd, roles, qual, with_check
    from pg_policies
   where schemaname = 'public'
     and (qual like '%auth.uid()%' or with_check like '%auth.uid()%'
       or qual like '%"current_role"()%' or with_check like '%"current_role"()%');

  for r in select * from _policies_a_reecrire loop
    -- `( SELECT auth.uid() …` est la forme déjà optimisée : on ne la retouche
    -- pas, sinon on emboîterait un select dans un select à chaque passage.
    v_qual := replace(replace(coalesce(r.qual, ''),
                '( SELECT auth.uid() AS uid)', 'auth.uid()'),
                '( SELECT "current_role"() AS "current_role")', '"current_role"()');
    v_check := replace(replace(coalesce(r.with_check, ''),
                '( SELECT auth.uid() AS uid)', 'auth.uid()'),
                '( SELECT "current_role"() AS "current_role")', '"current_role"()');

    v_qual := replace(v_qual, 'auth.uid()', '(select auth.uid())');
    v_qual := replace(v_qual, '"current_role"()', '(select public."current_role"())');
    v_check := replace(v_check, 'auth.uid()', '(select auth.uid())');
    v_check := replace(v_check, '"current_role"()', '(select public."current_role"())');

    v_sql := format('create policy %I on %I.%I as %s for %s to %s',
      r.policyname, r.schemaname, r.tablename,
      case when r.permissive = 'RESTRICTIVE' then 'restrictive' else 'permissive' end,
      case r.cmd when 'ALL' then 'all' else lower(r.cmd) end,
      (select string_agg(quote_ident(x), ', ') from unnest(r.roles) x));

    if r.qual is not null then
      v_sql := v_sql || ' using (' || v_qual || ')';
    end if;
    if r.with_check is not null then
      v_sql := v_sql || ' with check (' || v_check || ')';
    end if;

    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    execute v_sql;
  end loop;
end
$$;

-- Garde-fou : aucune policy ne doit avoir disparu, et plus aucune ne doit
-- appeler `auth.uid()` / `current_role()` hors d'un `(select …)`.
do $$
declare
  v_avant int;
  v_apres int;
  v_restantes int;
begin
  select count(*) into v_avant from public._rls_policy_backup_20260803;
  select count(*) into v_apres from pg_policies where schemaname = 'public';
  if v_apres < v_avant then
    raise exception 'Policies perdues : % avant, % après', v_avant, v_apres;
  end if;

  select count(*) into v_restantes
    from pg_policies
   where schemaname = 'public'
     and (
       (qual like '%auth.uid()%' and qual not like '%( SELECT auth.uid()%')
       or (with_check like '%auth.uid()%' and with_check not like '%( SELECT auth.uid()%')
     );
  if v_restantes > 0 then
    raise exception 'Il reste % policies avec auth.uid() non enveloppé', v_restantes;
  end if;
end
$$;
