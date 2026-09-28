-- Planificateur — audit du 28/09/2026.
--
-- A. Remplacement ATOMIQUE du planning futur d'un candidat. Avant : suppression
--    puis insertion en deux requêtes — une insertion en échec effaçait le
--    planning, deux recalculs simultanés (double clic, web + app, cron) le
--    dupliquaient. Désormais une seule transaction, verrouillée par candidat :
--      1. séances passées jamais terminées (planifiées ou commencées) → « sautée » ;
--      2. séances futures planifiées (ou sautées) supprimées ;
--      3. nouvelle génération insérée.
--    Les séances réalisées, commencées aujourd'hui ou reportées sont conservées.
-- B. Empreinte des preuves synchronisées depuis les QCM de la plateforme : une
--    synchronisation sans nouvelle tentative ne refusionne plus les mêmes
--    résultats (la confiance ne monte plus artificiellement).

create or replace function public.plan_replace_future_sessions(p_user uuid, p_from date, p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('plan_sessions:' || p_user::text, 0));

  update public.plan_sessions
     set status = 'sautee'
   where user_id = p_user and day < p_from and status in ('planifiee', 'en_cours');

  delete from public.plan_sessions
   where user_id = p_user and day >= p_from and status in ('planifiee', 'sautee');

  insert into public.plan_sessions (user_id, item_id, day, order_index, minutes, kind, status, priority_score, priority_tier, reason, plan_version, part, parts, origin, planned_day)
  select p_user, r.item_id, r.day, r.order_index, r.minutes, r.kind, 'planifiee', r.priority_score, r.priority_tier, coalesce(r.reason, ''), r.plan_version, r.part, r.parts,
         coalesce(r.origin, 'planning'), r.planned_day
    from jsonb_to_recordset(coalesce(p_rows, '[]'::jsonb)) as r(
      item_id uuid, day date, order_index int, minutes int, kind text, priority_score numeric, priority_tier text, reason text,
      plan_version int, part int, parts int, origin text, planned_day date
    );
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.plan_replace_future_sessions(uuid, date, jsonb) from public, anon, authenticated;
grant execute on function public.plan_replace_future_sessions(uuid, date, jsonb) to service_role;

alter table public.plan_mastery add column if not exists sync_fingerprint text;
