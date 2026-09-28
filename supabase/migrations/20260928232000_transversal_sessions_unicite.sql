-- =============================================================================
-- Migration : une session de révisions transversales = un (user_id, kind,
-- started_at) — idempotence de POST /api/mobile/revisions
-- =============================================================================
-- La route vérifiait l'existence puis insérait : deux envois concurrents de la
-- même session (file hors ligne de l'app) passaient tous les deux. L'index
-- unique ferme cette course ; la route traite 23505 comme `duplicate: true`
-- (sans relancer les alertes), l'action web comme un succès.
--
-- ATTENTION — les « doublons » existants NE SONT PAS des doublons. Comptage du
-- 28/09/2026 (lecture seule) : 10 groupes, 15 lignes en trop sur 753 ; dans
-- chaque groupe les scores diffèrent (ex. 10 → 15 → 22 → 24 sur 25) et les
-- completed_at sont espacés de plusieurs minutes à plusieurs heures. Ce sont
-- des passations « Refaire ces questions » du WEB, qui réutilisait le
-- started_at de la première passation (corrigé dans
-- src/components/student/transversal-session.tsx, comme l'app le faisait déjà).
-- Les supprimer effacerait des révisions réelles et fausserait les
-- statistiques (trigger transversal_sessions_stats). On les DÉSAMBIGUÏSE : la
-- plus ancienne ligne (created_at) garde son started_at, les suivantes sont
-- décalées de +1 ms, +2 ms…
--
--   select user_id, kind, started_at, count(*) as n,
--          array_agg(score_correct order by created_at) as scores,
--          array_agg(completed_at order by created_at) as fins
--     from public.transversal_sessions
--    group by 1, 2, 3
--   having count(*) > 1;
--
-- ORDRE DE DÉPLOIEMENT : publier d'abord le code (bouton « Refaire » du web qui
-- renouvelle started_at), PUIS appliquer cette migration — sinon une
-- repassation web échoue (23505 traité comme « déjà enregistrée » : la
-- repassation ne serait pas comptée).
--
-- Idempotente : le décalage ne touche que les groupes encore en double ;
-- l'index est créé `if not exists`.
-- =============================================================================

with rangs as (
  select id,
         row_number() over (
           partition by user_id, kind, started_at
           order by created_at, id
         ) - 1 as rang
    from public.transversal_sessions
)
update public.transversal_sessions t
   set started_at = t.started_at + interval '1 millisecond' * r.rang
  from rangs r
 where r.id = t.id
   and r.rang > 0;

-- Garde-fou : un décalage qui tomberait sur une autre session existante
-- (improbable) arrête la migration plutôt que de supprimer quoi que ce soit.
do $$
begin
  if exists (
    select 1 from public.transversal_sessions
     group by user_id, kind, started_at
    having count(*) > 1
  ) then
    raise exception 'transversal_sessions : doublons restants après désambiguïsation — rien n''est supprimé, vérifier à la main.';
  end if;
end $$;

create unique index if not exists transversal_sessions_user_kind_started_uniq
  on public.transversal_sessions (user_id, kind, started_at);
