-- Planificateur EVC — versions de matrice (demande Major ECN du 28/09/2026,
-- matrice MIPIC_2026_V1 de Médecine interne polyvalente).
--
-- Principe : une nouvelle matrice modifie le futur, jamais le passé.
--
-- A. Versions : chaque matrice est versionnée (MIPIC_2026_V1, V2…) avec sa date
--    d'activation. Une version « programmée » s'applique d'elle-même à sa date
--    (balayage quotidien) ; une seule version active par spécialité. Chaque
--    version garde l'instantané de ses items (statut, coefficients, changement
--    par rapport à la précédente) : traçabilité matrix_version + date.
-- B. Statut d'un item : ACTIVE (contenu disponible, planifiable), COMING_SOON
--    (identifié, jamais proposé à l'élève), RETIRE (absent de la version
--    courante : conservé, jamais supprimé, pour garder l'historique des élèves).
-- C. Recouvrements : part des connaissances d'un item déjà couverte par un
--    autre ; le travail fait sur l'un est pris en compte pour l'autre.
-- D. Protection de l'historique : un item portant du travail d'élève (séance
--    réalisée, évaluation, temps, résultats, réactivation) ne peut plus être
--    supprimé — les cascades effaceraient ce travail. On le retire.
-- E. Reprise : la matrice Médecine générale déjà en base devient MG_2026_V1.
-- Sans risque à relancer.

-- A. Versions
create table if not exists public.plan_matrix_versions (
  id             uuid primary key default gen_random_uuid(),
  faculte_id     text not null default 'major-ecn',
  specialite_id  text not null references public.matieres(id) on delete cascade,
  matrix         text not null,
  version        int not null check (version >= 1),
  code           text not null,
  label          text,
  active_from    date not null,
  status         text not null default 'programmee' check (status in ('programmee','active','archivee','annulee')),
  activated_at   timestamptz,
  source_file    text,
  rules          jsonb not null default '{}'::jsonb,
  payload        jsonb not null default '[]'::jsonb,
  summary        jsonb not null default '{}'::jsonb,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (faculte_id, code),
  unique (faculte_id, matrix, version)
);
create unique index if not exists plan_matrix_versions_one_active
  on public.plan_matrix_versions(faculte_id, specialite_id) where status = 'active';
create index if not exists plan_matrix_versions_due on public.plan_matrix_versions(active_from) where status = 'programmee';

create table if not exists public.plan_matrix_version_items (
  id          uuid primary key default gen_random_uuid(),
  version_id  uuid not null references public.plan_matrix_versions(id) on delete cascade,
  item_id     uuid references public.plan_items(id) on delete set null,
  specialite_id text not null,
  nom_item    text not null,
  statut      text not null check (statut in ('active','coming_soon','retire')),
  change      text not null check (change in ('ajoute','active','modifie','inchange','retire','a_venir')),
  data        jsonb not null default '{}'::jsonb,
  unique (version_id, specialite_id, nom_item)
);
create index if not exists plan_matrix_version_items_item_idx on public.plan_matrix_version_items(item_id);

-- B. Statut et traçabilité des items
alter table public.plan_items add column if not exists statut text not null default 'active';
alter table public.plan_items drop constraint if exists plan_items_statut_check;
alter table public.plan_items add constraint plan_items_statut_check check (statut in ('active','coming_soon','retire'));
alter table public.plan_items add column if not exists origine text;
alter table public.plan_items add column if not exists matrix_version_id uuid references public.plan_matrix_versions(id) on delete set null;
alter table public.plan_items add column if not exists active_since date;
create index if not exists plan_items_statut_idx on public.plan_items(specialite_id) where statut = 'active' and actif;

-- C. Recouvrements
create table if not exists public.plan_item_overlaps (
  item_id          uuid not null references public.plan_items(id) on delete cascade,
  related_item_id  uuid not null references public.plan_items(id) on delete cascade,
  part             numeric(3,2) not null check (part > 0 and part <= 1),
  created_at       timestamptz not null default now(),
  primary key (item_id, related_item_id),
  check (item_id <> related_item_id)
);
create index if not exists plan_item_overlaps_related_idx on public.plan_item_overlaps(related_item_id);

-- D. Protection de l'historique des élèves
create index if not exists plan_sessions_item_idx on public.plan_sessions(item_id);
create index if not exists plan_mastery_item_idx on public.plan_mastery(item_id);
create index if not exists plan_evaluations_item_idx on public.plan_evaluations(item_id);

create or replace function public.plan_items_protect_history()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.plan_sessions where item_id = old.id and status in ('terminee','en_cours'))
     or exists (select 1 from public.plan_evaluations where item_id = old.id and completed_at is not null)
     or exists (select 1 from public.plan_mastery where item_id = old.id
                  and (activity_count > 0 or time_spent_minutes > 0 or results_count > 0 or reactivation_count > 0 or learning_minutes_done > 0))
  then
    raise exception 'Item « % » : du travail d''élève y est rattaché. Retirez-le de la matrice au lieu de le supprimer.', old.nom_item
      using errcode = 'P0001';
  end if;
  return old;
end;
$$;
drop trigger if exists plan_items_protect_history on public.plan_items;
create trigger plan_items_protect_history before delete on public.plan_items
  for each row execute function public.plan_items_protect_history();

-- RLS : administration ; les élèves n'en ont pas besoin (lecture service-role).
do $$
declare t text;
begin
  foreach t in array array['plan_matrix_versions','plan_matrix_version_items','plan_item_overlaps']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format('create policy %I_admin_all on public.%I for all using (public.current_role() = ''admin'') with check (public.current_role() = ''admin'')', t, t);
  end loop;
end $$;

-- E. Reprise de la matrice Médecine générale 2026 (importée le 28/09/2026) en MG_2026_V1.
do $$
declare
  v uuid;
  family text[];
begin
  select array_agg(id) into family from public.matieres
   where id = 'col-medecine-generale' or parent_matiere_id = 'col-medecine-generale';
  if family is null or not exists (select 1 from public.plan_items where specialite_id = any(family)) then return; end if;
  select id into v from public.plan_matrix_versions where faculte_id = 'major-ecn' and code = 'MG_2026_V1';
  if v is null then
    insert into public.plan_matrix_versions (specialite_id, matrix, version, code, label, active_from, status, activated_at, source_file, summary)
    -- activée à la date de l'import d'origine : les plannings déjà calculés sur cette matrice sont à jour.
    select 'col-medecine-generale', 'MG_2026', 1, 'MG_2026_V1', 'Matrice Médecine générale 2026', date '2026-09-28', 'active', min(created_at),
           'Matrices planificateur MG (import du 28/09/2026)',
           jsonb_build_object('reprise', true, 'active', count(*), 'coming_soon', 0, 'ajoutes', count(*))
      from public.plan_items where specialite_id = any(family)
    returning id into v;
  end if;
  update public.plan_items set matrix_version_id = v, active_since = coalesce(active_since, date '2026-09-28'), origine = coalesce(origine, 'Matrice MG 2026')
   where specialite_id = any(family) and matrix_version_id is null;
  insert into public.plan_matrix_version_items (version_id, item_id, specialite_id, nom_item, statut, change, data)
  select v, i.id, i.specialite_id, i.nom_item, i.statut, 'ajoute',
         jsonb_build_object('cours_id', i.cours_id, 'importance', i.importance, 'recence', i.recence,
                            'temps_reference', i.temps_reference, 'criteres', i.criteres, 'score_interne', i.score_interne, 'score_externe', i.score_externe)
    from public.plan_items i
   where i.specialite_id = any(family)
  on conflict (version_id, specialite_id, nom_item) do nothing;
end $$;
