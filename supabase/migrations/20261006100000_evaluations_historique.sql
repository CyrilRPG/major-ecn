-- ════════════════════════════════════════════════════════════════════════════
-- Historique des évaluations — courbe de progression — traçabilité pédagogique
-- (complément au cahier des charges, 06/10/2026)
--
-- Aucun second système de résultats : les notes restent dans leurs tables
-- (checkup_sessions, mock_exam_submissions, major_parcours_completions,
-- transversal_sessions, parcours_completions). Cette migration ajoute :
--
--   1. un journal INALTÉRABLE de ce qui, jusqu'ici, effaçait une note sans
--      trace : `evaluation_archives` (tentative écrasée par une nouvelle,
--      copie supprimée, copie réinitialisée) et `evaluation_corrections`
--      (ancienne valeur, nouvelle valeur, date, auteur, motif) ;
--   2. les déclencheurs qui alimentent ce journal sur chaque table source —
--      seulement une fois le résultat DÉFINITIF (le cycle normal de correction
--      n'est pas une « modification ») ;
--   3. la vue `evaluations_historique` : une ligne par tentative, sources et
--      archives confondues, clé unique `cle` (aucun doublon) ;
--   4. deux fonctions réservées au service-role : correction d'une note avec
--      motif obligatoire, réinitialisation d'une épreuve pour un élève.
--
-- Compte supprimé (RGPD) : rien n'est archivé et le journal part avec lui.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Journal ─────────────────────────────────────────────────────────────

create table if not exists public.evaluation_archives (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('checkup', 'epreuve', 'interrogation_cours', 'parcours_major', 'transversale')),
  source_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  raison text not null check (raison in ('nouvelle_tentative', 'suppression', 'reinitialisation')),
  -- Ligne source complète au moment de l'archivage (+ réponses pour une copie d'épreuve).
  donnees jsonb not null,
  -- Ce qui pourrait disparaître avec l'objet parent : intitulé, numéro, spécialité…
  contexte jsonb not null default '{}'::jsonb,
  archived_at timestamptz not null default now(),
  auteur uuid,
  auteur_libelle text,
  motif text
);
create index if not exists evaluation_archives_user_idx on public.evaluation_archives (user_id, archived_at desc);
create index if not exists evaluation_archives_source_idx on public.evaluation_archives (source, source_id);

create table if not exists public.evaluation_corrections (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('checkup', 'epreuve', 'interrogation_cours', 'parcours_major', 'transversale')),
  source_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  champ text not null,
  ancienne_valeur jsonb,
  nouvelle_valeur jsonb,
  corrige_le timestamptz not null default now(),
  auteur uuid,
  auteur_libelle text,
  motif text
);
create index if not exists evaluation_corrections_user_idx on public.evaluation_corrections (user_id, corrige_le desc);
create index if not exists evaluation_corrections_source_idx on public.evaluation_corrections (source, source_id);

-- Service-role seulement : RLS active, aucune policy.
alter table public.evaluation_archives enable row level security;
alter table public.evaluation_corrections enable row level security;
revoke all on public.evaluation_archives from anon, authenticated;
revoke all on public.evaluation_corrections from anon, authenticated;

-- Le journal ne se modifie ni ne se supprime — sauf départ du compte (cascade RGPD).
create or replace function public.trg_eval_journal_immuable()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' and not exists (select 1 from auth.users where id = old.user_id) then
    return old;
  end if;
  raise exception 'Journal des évaluations : une archive ou une correction ne se modifie ni ne se supprime (%).', tg_table_name
    using errcode = '42501';
end $$;

drop trigger if exists evaluation_archives_immuable on public.evaluation_archives;
create trigger evaluation_archives_immuable before update or delete on public.evaluation_archives
  for each row execute function public.trg_eval_journal_immuable();
drop trigger if exists evaluation_corrections_immuable on public.evaluation_corrections;
create trigger evaluation_corrections_immuable before update or delete on public.evaluation_corrections
  for each row execute function public.trg_eval_journal_immuable();

-- ─── Auteur et motif d'une écriture ─────────────────────────────────────────
-- 1. `app.eval_auteur` / `app.eval_motif` posés par les fonctions admin ci-dessous ;
-- 2. en-têtes `x-eval-auteur` / `x-eval-motif` (base64 UTF-8) d'une requête
--    SERVICE-ROLE (jamais ceux d'un élève, qui pourrait les forger) ;
-- 3. à défaut, l'utilisateur connecté (`auth.uid()`), sinon « traitement automatique ».

create or replace function public.eval_trace_auteur()
returns uuid language plpgsql stable security definer set search_path = public as $$
declare v text;
begin
  v := nullif(current_setting('app.eval_auteur', true), '');
  if v is null and coalesce(auth.role(), '') = 'service_role' then
    begin
      v := nullif(current_setting('request.headers', true)::json ->> 'x-eval-auteur', '');
    exception when others then v := null;
    end;
  end if;
  if v is not null then
    begin
      return v::uuid;
    exception when others then null;
    end;
  end if;
  return auth.uid();
end $$;

create or replace function public.eval_trace_motif()
returns text language plpgsql stable security definer set search_path = public as $$
declare v text;
begin
  v := nullif(current_setting('app.eval_motif', true), '');
  if v is null and coalesce(auth.role(), '') = 'service_role' then
    begin
      v := convert_from(decode(nullif(current_setting('request.headers', true)::json ->> 'x-eval-motif', ''), 'base64'), 'UTF8');
    exception when others then v := null;
    end;
  end if;
  return left(v, 1000);
end $$;

-- Libellé figé de l'auteur (le journal reste lisible si le compte disparaît).
create or replace function public.eval_libelle(p uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(nullif(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), ''), email, 'Compte ' || left(p::text, 8))
         || case role when 'admin' then ' (administration)' when 'professor' then ' (équipe pédagogique)' when 'student' then ' (élève)' else '' end
  from profiles where id = p
$$;

create or replace function public.eval_noter_correction(
  p_source text, p_id uuid, p_user uuid, p_champ text, p_old jsonb, p_new jsonb,
  p_auteur uuid default null, p_motif text default null
) returns void language plpgsql security definer set search_path = public as $$
declare a uuid;
begin
  if p_old is not distinct from p_new then return; end if;
  if not exists (select 1 from auth.users where id = p_user) then return; end if;
  a := coalesce(p_auteur, public.eval_trace_auteur());
  insert into public.evaluation_corrections (source, source_id, user_id, champ, ancienne_valeur, nouvelle_valeur, auteur, auteur_libelle, motif)
  values (p_source, p_id, p_user, p_champ, p_old, p_new, a, public.eval_libelle(a), coalesce(p_motif, public.eval_trace_motif()));
end $$;

create or replace function public.eval_archiver(
  p_source text, p_id uuid, p_user uuid, p_raison text, p_donnees jsonb, p_contexte jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare a uuid;
begin
  -- Compte en cours de suppression (cascade depuis auth.users) : effacement voulu, rien à garder.
  if not exists (select 1 from auth.users where id = p_user) then return; end if;
  a := public.eval_trace_auteur();
  insert into public.evaluation_archives (source, source_id, user_id, raison, donnees, contexte, auteur, auteur_libelle, motif)
  values (p_source, p_id, p_user, p_raison, p_donnees, coalesce(p_contexte, '{}'::jsonb), a, public.eval_libelle(a), public.eval_trace_motif());
end $$;

-- Une note d'interrogation de fin d'item (`parcours_completions`) est-elle la
-- simple COPIE d'une copie d'épreuve (interrogation passée sur le moteur
-- d'épreuve) ? La copie est reportée APRÈS la remise : toute remise antérieure
-- ou égale, pour cet élève et cet item, la désigne. Une copie n'est jamais
-- comptée deux fois (R8).
create or replace function public.eval_note_copie_interrogation(p_user uuid, p_cours uuid, p_at timestamptz)
returns boolean language sql stable security definer set search_path = public as $$
  select p_at is not null and (
    exists (
      select 1 from mock_exams e join mock_exam_submissions s on s.exam_id = e.id
      where e.cours_id = p_cours and s.user_id = p_user and s.submitted_at is not null and s.submitted_at <= p_at
    ) or exists (
      select 1 from evaluation_archives a
      where a.source = 'epreuve' and a.user_id = p_user and a.contexte ->> 'cours_id' = p_cours::text
        and (a.donnees ->> 'submitted_at') is not null and (a.donnees ->> 'submitted_at')::timestamptz <= p_at
    )
  )
$$;

-- ─── 2. Déclencheurs sur les tables sources ────────────────────────────────

-- EVC Check-up : une ligne par tentative. On trace la neutralisation et toute
-- retouche d'un score DÉFINITIF ; une suppression est archivée (avec le
-- résumé question par question).
create or replace function public.trg_eval_checkup()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    -- Retour arrière d'une création échouée : jamais commencée, rien à garder.
    if old.status = 'active' and not exists (
      select 1 from checkup_questions q where q.session_id = old.id and (q.answer is not null or q.presented_at is not null)
    ) then
      return old;
    end if;
    perform public.eval_archiver('checkup', old.id, old.user_id, 'suppression',
      to_jsonb(old) - 'composition' || jsonb_build_object('questions', (
        select jsonb_agg(jsonb_build_object('position', q.position, 'item_id', q.item_id, 'type', q.question_type, 'result', q.result, 'points', q.points) order by q.position)
        from checkup_questions q where q.session_id = old.id)),
      jsonb_build_object('specialite_id', old.specialite_id, 'specialite', (select m.nom from matieres m where m.id = old.specialite_id)));
    return old;
  end if;

  if old.status not in ('completed', 'expired') then return new; end if;
  if new.status is distinct from old.status then
    perform public.eval_noter_correction('checkup', new.id, new.user_id, 'statut', to_jsonb(old.status), to_jsonb(new.status),
      case when new.status = 'cancelled_technical' then new.neutralized_by end,
      case when new.status = 'cancelled_technical' then coalesce('Neutralisation (incident technique) : ' || new.neutralized_reason, 'Neutralisation (incident technique)') end);
  end if;
  -- Score : le premier calcul (null → valeur) est la finalisation, pas une correction.
  if old.score_percent is not null then
    perform public.eval_noter_correction('checkup', new.id, new.user_id, 'score_percent', to_jsonb(old.score_percent), to_jsonb(new.score_percent));
    perform public.eval_noter_correction('checkup', new.id, new.user_id, 'points_obtained', to_jsonb(old.points_obtained), to_jsonb(new.points_obtained));
    perform public.eval_noter_correction('checkup', new.id, new.user_id, 'points_possible', to_jsonb(old.points_possible), to_jsonb(new.points_possible));
  end if;
  return new;
end $$;

drop trigger if exists checkup_sessions_eval_trace on public.checkup_sessions;
create trigger checkup_sessions_eval_trace after update on public.checkup_sessions
  for each row execute function public.trg_eval_checkup();
drop trigger if exists checkup_sessions_eval_archive on public.checkup_sessions;
create trigger checkup_sessions_eval_archive before delete on public.checkup_sessions
  for each row execute function public.trg_eval_checkup();

-- Épreuves blanches et interrogations (moteur d'épreuve).
create or replace function public.eval_contexte_epreuve(p_exam uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'exam_id', e.id, 'titre', e.title, 'specialite_id', e.specialite_id, 'cours_id', e.cours_id, 'college_id', e.college_id,
    'specialite', (select m.nom from matieres m where m.id = coalesce(e.specialite_id, e.college_id, (select c.matiere_id from cours c where c.id = e.cours_id))))
  from mock_exams e where e.id = p_exam
$$;

create or replace function public.trg_eval_epreuve()
returns trigger language plpgsql security definer set search_path = public as $$
declare ctx jsonb;
begin
  if tg_op = 'DELETE' then
    ctx := public.eval_contexte_epreuve(old.exam_id);
    -- Épreuve supprimée : ses copies ont déjà été archivées par trg_eval_epreuve_supprimee.
    if ctx is null then return old; end if;
    -- « Refaire l'épreuve » (admin_reinitialiser_epreuve_eleve) pose la raison exacte.
    perform public.eval_archiver('epreuve', old.id, old.user_id, coalesce(nullif(current_setting('app.eval_raison', true), ''), 'suppression'),
      to_jsonb(old) || jsonb_build_object('answers', (select jsonb_agg(to_jsonb(a) order by a.question_id) from mock_exam_answers a where a.submission_id = old.id)),
      ctx);
    return old;
  end if;

  -- Copie rouverte : la tentative remise est archivée, la nouvelle ne l'écrase pas.
  if old.status in ('submitted', 'graded') and new.status = 'in_progress' then
    perform public.eval_archiver('epreuve', old.id, old.user_id, 'reinitialisation',
      to_jsonb(old) || jsonb_build_object('answers', (select jsonb_agg(to_jsonb(a) order by a.question_id) from mock_exam_answers a where a.submission_id = old.id)),
      public.eval_contexte_epreuve(old.exam_id));
    return new;
  end if;

  if old.status <> 'graded' then return new; end if;
  perform public.eval_noter_correction('epreuve', new.id, new.user_id, 'statut', to_jsonb(old.status), to_jsonb(new.status));
  perform public.eval_noter_correction('epreuve', new.id, new.user_id, 'score', to_jsonb(old.score), to_jsonb(new.score));
  perform public.eval_noter_correction('epreuve', new.id, new.user_id, 'max_score', to_jsonb(old.max_score), to_jsonb(new.max_score));
  perform public.eval_noter_correction('epreuve', new.id, new.user_id, 'percentage', to_jsonb(old.percentage), to_jsonb(new.percentage));
  return new;
end $$;

drop trigger if exists mock_exam_submissions_eval_trace on public.mock_exam_submissions;
create trigger mock_exam_submissions_eval_trace before update on public.mock_exam_submissions
  for each row execute function public.trg_eval_epreuve();
drop trigger if exists mock_exam_submissions_eval_archive on public.mock_exam_submissions;
create trigger mock_exam_submissions_eval_archive before delete on public.mock_exam_submissions
  for each row execute function public.trg_eval_epreuve();

-- Suppression d'une épreuve : la cascade emporterait toutes ses copies.
create or replace function public.trg_eval_epreuve_supprimee()
returns trigger language plpgsql security definer set search_path = public as $$
declare s record; ctx jsonb;
begin
  ctx := public.eval_contexte_epreuve(old.id);
  for s in select * from mock_exam_submissions where exam_id = old.id loop
    perform public.eval_archiver('epreuve', s.id, s.user_id, 'suppression',
      to_jsonb(s) || jsonb_build_object('answers', (select jsonb_agg(to_jsonb(a) order by a.question_id) from mock_exam_answers a where a.submission_id = s.id)),
      ctx || jsonb_build_object('epreuve_supprimee', true));
  end loop;
  return old;
end $$;

drop trigger if exists mock_exams_eval_archive on public.mock_exams;
create trigger mock_exams_eval_archive before delete on public.mock_exams
  for each row execute function public.trg_eval_epreuve_supprimee();

-- Parcours du Major : UNE ligne par (élève, niveau), réécrite à chaque reprise.
-- La tentative précédente est archivée avant d'être remplacée (R4).
create or replace function public.trg_eval_parcours_major()
returns trigger language plpgsql security definer set search_path = public as $$
declare ctx jsonb;
begin
  if tg_op = 'DELETE' then
    select jsonb_build_object('numero', p.numero, 'titre', p.titre) into ctx from major_parcours p where p.id = old.parcours_id;
    if ctx is null then return old; end if; -- niveau supprimé : archivé par trg_eval_parcours_major_supprime
    perform public.eval_archiver('parcours_major', old.id, old.user_id, 'suppression', to_jsonb(old), ctx);
    return old;
  end if;

  if new.completed_at is distinct from old.completed_at then
    select jsonb_build_object('numero', p.numero, 'titre', p.titre) into ctx from major_parcours p where p.id = old.parcours_id;
    perform public.eval_archiver('parcours_major', old.id, old.user_id, 'nouvelle_tentative', to_jsonb(old), ctx);
  else
    perform public.eval_noter_correction('parcours_major', new.id, new.user_id, 'score', to_jsonb(old.score), to_jsonb(new.score));
    perform public.eval_noter_correction('parcours_major', new.id, new.user_id, 'band', to_jsonb(old.band), to_jsonb(new.band));
  end if;
  return new;
end $$;

drop trigger if exists major_parcours_completions_eval_trace on public.major_parcours_completions;
create trigger major_parcours_completions_eval_trace before update or delete on public.major_parcours_completions
  for each row execute function public.trg_eval_parcours_major();

create or replace function public.trg_eval_parcours_major_supprime()
returns trigger language plpgsql security definer set search_path = public as $$
declare c record;
begin
  for c in select * from major_parcours_completions where parcours_id = old.id loop
    perform public.eval_archiver('parcours_major', c.id, c.user_id, 'suppression', to_jsonb(c),
      jsonb_build_object('numero', old.numero, 'titre', old.titre, 'niveau_supprime', true));
  end loop;
  return old;
end $$;

drop trigger if exists major_parcours_eval_archive on public.major_parcours;
create trigger major_parcours_eval_archive before delete on public.major_parcours
  for each row execute function public.trg_eval_parcours_major_supprime();

-- Révisions transversales (dont réévaluations et bilans) : une ligne par session.
create or replace function public.trg_eval_transversale()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.eval_archiver('transversale', old.id, old.user_id, 'suppression', to_jsonb(old), jsonb_build_object('kind', old.kind));
    return old;
  end if;
  if old.completed_at is null then return new; end if;
  perform public.eval_noter_correction('transversale', new.id, new.user_id, 'score_correct', to_jsonb(old.score_correct), to_jsonb(new.score_correct));
  perform public.eval_noter_correction('transversale', new.id, new.user_id, 'qcm_count', to_jsonb(old.qcm_count), to_jsonb(new.qcm_count));
  return new;
end $$;

drop trigger if exists transversal_sessions_eval_trace on public.transversal_sessions;
create trigger transversal_sessions_eval_trace after update on public.transversal_sessions
  for each row execute function public.trg_eval_transversale();
drop trigger if exists transversal_sessions_eval_archive on public.transversal_sessions;
create trigger transversal_sessions_eval_archive before delete on public.transversal_sessions
  for each row execute function public.trg_eval_transversale();

-- Interrogation de fin d'item (`parcours_completions`, UNE ligne par élève et item).
create or replace function public.trg_eval_interrogation_cours()
returns trigger language plpgsql security definer set search_path = public as $$
declare ctx jsonb;
begin
  if tg_op = 'DELETE' then
    if old.qcm_test_completed_at is null then return old; end if;
    select jsonb_build_object('cours_id', c.id, 'titre', c.titre, 'specialite_id', c.matiere_id) into ctx from cours c where c.id = old.cours_id;
    if ctx is null then return old; end if; -- item supprimé : archivé par trg_eval_cours_supprime
    if public.eval_note_copie_interrogation(old.user_id, old.cours_id, old.qcm_test_completed_at) then return old; end if;
    perform public.eval_archiver('interrogation_cours', old.id, old.user_id, 'suppression', to_jsonb(old) - 'signature_data_url', ctx);
    return old;
  end if;

  if old.qcm_test_completed_at is null then return new; end if;
  if new.qcm_test_completed_at is distinct from old.qcm_test_completed_at then
    -- Report répété de la même note (l'écran de résultats la renvoie à chaque
    -- affichage) : ce n'est pas une nouvelle tentative, la 1re date est gardée.
    if new.qcm_test_score is not distinct from old.qcm_test_score and new.qcm_test_total is not distinct from old.qcm_test_total then
      new.qcm_test_completed_at := old.qcm_test_completed_at;
      return new;
    end if;
    if not public.eval_note_copie_interrogation(old.user_id, old.cours_id, old.qcm_test_completed_at) then
      select jsonb_build_object('cours_id', c.id, 'titre', c.titre, 'specialite_id', c.matiere_id) into ctx from cours c where c.id = old.cours_id;
      perform public.eval_archiver('interrogation_cours', old.id, old.user_id, 'nouvelle_tentative', to_jsonb(old) - 'signature_data_url', ctx);
    end if;
    return new;
  end if;

  if not public.eval_note_copie_interrogation(old.user_id, old.cours_id, old.qcm_test_completed_at) then
    perform public.eval_noter_correction('interrogation_cours', new.id, new.user_id, 'qcm_test_score', to_jsonb(old.qcm_test_score), to_jsonb(new.qcm_test_score));
    perform public.eval_noter_correction('interrogation_cours', new.id, new.user_id, 'qcm_test_total', to_jsonb(old.qcm_test_total), to_jsonb(new.qcm_test_total));
  end if;
  return new;
end $$;

drop trigger if exists parcours_completions_eval_trace on public.parcours_completions;
create trigger parcours_completions_eval_trace before update or delete on public.parcours_completions
  for each row execute function public.trg_eval_interrogation_cours();

create index if not exists parcours_completions_cours_idx on public.parcours_completions (cours_id);

create or replace function public.trg_eval_cours_supprime()
returns trigger language plpgsql security definer set search_path = public as $$
declare p record;
begin
  for p in select * from parcours_completions where cours_id = old.id and qcm_test_completed_at is not null loop
    if not public.eval_note_copie_interrogation(p.user_id, p.cours_id, p.qcm_test_completed_at) then
      perform public.eval_archiver('interrogation_cours', p.id, p.user_id, 'suppression', to_jsonb(p) - 'signature_data_url',
        jsonb_build_object('cours_id', old.id, 'titre', old.titre, 'specialite_id', old.matiere_id, 'item_supprime', true));
    end if;
  end loop;
  return old;
end $$;

drop trigger if exists cours_eval_archive on public.cours;
create trigger cours_eval_archive before delete on public.cours
  for each row execute function public.trg_eval_cours_supprime();

-- ─── 3. Vue unifiée ─────────────────────────────────────────────────────────
-- Une ligne par tentative. `cle` = source:id (tentative en place) ou
-- archive:id (tentative archivée) : unique par construction.
-- `type` : diagnostic (EVC Check-up), concours_blanc (épreuve blanche),
-- interrogation (spécialité ou fin d'item), suivi (réévaluations, bilans),
-- methodologie (Parcours du Major), entrainement (révisions transversales
-- courantes — notées, mais distinctes des évaluations).
-- `statut` : commence | termine | non_termine ; `etat` : statut d'origine.

create or replace view public.evaluations_historique as
with
checkup_all as (
  select c.*, null::uuid as archive_id, null::text as archive_raison, null::timestamptz as archive_le, null::text as archive_motif, null::text as archive_auteur, '{}'::jsonb as contexte
  from public.checkup_sessions c
  union all
  select r.*, a.id, a.raison, a.archived_at, a.motif, a.auteur_libelle, a.contexte
  from public.evaluation_archives a cross join lateral jsonb_populate_record(null::public.checkup_sessions, a.donnees) r
  where a.source = 'checkup'
),
epreuve_all as (
  select s.*, null::uuid as archive_id, null::text as archive_raison, null::timestamptz as archive_le, null::text as archive_motif, null::text as archive_auteur, '{}'::jsonb as contexte
  from public.mock_exam_submissions s
  union all
  select r.*, a.id, a.raison, a.archived_at, a.motif, a.auteur_libelle, a.contexte
  from public.evaluation_archives a cross join lateral jsonb_populate_record(null::public.mock_exam_submissions, a.donnees) r
  where a.source = 'epreuve'
),
parcours_all as (
  select m.*, null::uuid as archive_id, null::text as archive_raison, null::timestamptz as archive_le, null::text as archive_motif, null::text as archive_auteur, '{}'::jsonb as contexte
  from public.major_parcours_completions m
  union all
  select r.*, a.id, a.raison, a.archived_at, a.motif, a.auteur_libelle, a.contexte
  from public.evaluation_archives a cross join lateral jsonb_populate_record(null::public.major_parcours_completions, a.donnees) r
  where a.source = 'parcours_major'
),
transversale_all as (
  select t.*, null::uuid as archive_id, null::text as archive_raison, null::timestamptz as archive_le, null::text as archive_motif, null::text as archive_auteur, '{}'::jsonb as contexte
  from public.transversal_sessions t
  union all
  select r.*, a.id, a.raison, a.archived_at, a.motif, a.auteur_libelle, a.contexte
  from public.evaluation_archives a cross join lateral jsonb_populate_record(null::public.transversal_sessions, a.donnees) r
  where a.source = 'transversale'
),
interro_all as (
  select p.*, null::uuid as archive_id, null::text as archive_raison, null::timestamptz as archive_le, null::text as archive_motif, null::text as archive_auteur, '{}'::jsonb as contexte
  from public.parcours_completions p
  where p.qcm_test_completed_at is not null
    and not public.eval_note_copie_interrogation(p.user_id, p.cours_id, p.qcm_test_completed_at)
  union all
  select r.*, a.id, a.raison, a.archived_at, a.motif, a.auteur_libelle, a.contexte
  from public.evaluation_archives a cross join lateral jsonb_populate_record(null::public.parcours_completions, a.donnees) r
  where a.source = 'interrogation_cours'
),
unifie as (
  -- EVC Check-up
  select
    case when x.archive_id is null then 'checkup:' || x.id else 'archive:' || x.archive_id end as cle,
    'checkup'::text as source, x.id as source_id, x.archive_id, x.user_id,
    'diagnostic'::text as type,
    case when x.mode = 'global' then 'EVC Check-up global' else 'EVC Check-up ciblé' end as intitule,
    x.specialite_id, x.voie,
    null::uuid as exam_id, null::uuid as cours_id, null::integer as numero,
    x.started_at as debut, coalesce(x.completed_at, x.submitted_at) as fin,
    case
      when x.status in ('completed', 'expired', 'pending_self_review') then 'termine'
      when x.status = 'active' and x.archive_id is null and (x.deadline_at is null or x.deadline_at > now()) then 'commence'
      else 'non_termine'
    end as statut,
    x.status as etat,
    case when x.status in ('completed', 'expired') then x.points_obtained end as score,
    case when x.status in ('completed', 'expired') then x.points_possible end as score_max,
    case when x.status in ('completed', 'expired') then x.score_percent end as pourcentage,
    x.duration_seconds as duree_secondes, x.question_count as nb_questions,
    true as resultats_visibles,
    jsonb_strip_nulls(jsonb_build_object('format', x.format, 'mode', x.mode, 'domaines', x.results -> 'byDomain', 'neutralisation', x.neutralized_reason)) as detail,
    x.archive_raison, x.archive_le, x.archive_motif, x.archive_auteur
  from checkup_all x

  union all
  -- Épreuves blanches et interrogations passées sur le moteur d'épreuve
  select
    case when x.archive_id is null then 'epreuve:' || x.id else 'archive:' || x.archive_id end,
    'epreuve', x.id, x.archive_id, x.user_id,
    case when coalesce(e.specialite_id, x.contexte ->> 'specialite_id') is not null
           or coalesce(e.cours_id::text, x.contexte ->> 'cours_id') is not null then 'interrogation' else 'concours_blanc' end,
    coalesce(e.title, x.contexte ->> 'titre', 'Épreuve'),
    coalesce(e.specialite_id, e.college_id, ec.matiere_id, x.contexte ->> 'specialite_id', x.contexte ->> 'college_id'),
    null::text,
    x.exam_id, coalesce(e.cours_id, (x.contexte ->> 'cours_id')::uuid), null::integer,
    x.started_at, coalesce(x.submitted_at, x.graded_at),
    case
      when x.status in ('submitted', 'graded') then 'termine'
      when x.status = 'in_progress' and x.archive_id is null then 'commence'
      else 'non_termine'
    end,
    x.status,
    case when x.status = 'graded' then x.score end,
    case when x.status = 'graded' then x.max_score end,
    case when x.status = 'graded' then x.percentage end,
    x.time_spent_seconds,
    case when x.archive_id is null then (select count(*)::integer from public.mock_exam_answers an where an.submission_id = x.id) end,
    case
      when e.id is null then true
      when e.results_publish_mode = 'after_close' then e.close_at is null or now() > e.close_at
      when e.results_publish_mode = 'at_datetime' then e.results_publish_at is not null and now() >= e.results_publish_at
      else true
    end,
    case when x.per_college is not null then jsonb_build_object('specialites', x.per_college) else '{}'::jsonb end,
    x.archive_raison, x.archive_le, x.archive_motif, x.archive_auteur
  from epreuve_all x
  left join public.mock_exams e on e.id = x.exam_id
  left join public.cours ec on ec.id = e.cours_id

  union all
  -- Parcours du Major (note sur 10)
  select
    case when x.archive_id is null then 'parcours_major:' || x.id else 'archive:' || x.archive_id end,
    'parcours_major', x.id, x.archive_id, x.user_id,
    'methodologie',
    'Parcours du Major — niveau ' || coalesce(p.numero::text, x.contexte ->> 'numero', '?') || coalesce(' : ' || coalesce(p.titre, x.contexte ->> 'titre'), ''),
    null::text, null::text,
    null::uuid, null::uuid, coalesce(p.numero, (x.contexte ->> 'numero')::integer),
    null::timestamptz, x.completed_at,
    'termine', coalesce(x.band, 'termine'),
    x.score, 10::numeric, round(x.score * 10, 1),
    null::integer,
    case when jsonb_typeof(x.answers) = 'object' then (select count(*)::integer from jsonb_object_keys(x.answers)) end,
    true,
    jsonb_strip_nulls(jsonb_build_object('niveau', x.band)),
    x.archive_raison, x.archive_le, x.archive_motif, x.archive_auteur
  from parcours_all x
  left join public.major_parcours p on p.id = x.parcours_id

  union all
  -- Révisions transversales, réévaluations et bilans
  select
    case when x.archive_id is null then 'transversale:' || x.id else 'archive:' || x.archive_id end,
    'transversale', x.id, x.archive_id, x.user_id,
    case when x.kind in ('reevaluation', 'reevaluation_deep', 'bilan_global') then 'suivi' else 'entrainement' end,
    case x.kind
      when 'daily' then 'Révision transversale du jour'
      when 'recommended' then 'Révision transversale recommandée'
      when 'intensive' then 'Révision transversale intensive'
      when 'reevaluation' then 'Réévaluation'
      when 'reevaluation_deep' then 'Réévaluation approfondie'
      when 'bilan_global' then 'Bilan global'
      else 'Révision transversale'
    end,
    case when jsonb_typeof(x.matiere_scores) = 'object' and (select count(*) from jsonb_object_keys(x.matiere_scores)) = 1
      then (select k from jsonb_object_keys(x.matiere_scores) k limit 1) end,
    null::text,
    null::uuid, null::uuid, null::integer,
    x.started_at, x.completed_at,
    case when x.completed_at is not null then 'termine' when x.archive_id is null then 'commence' else 'non_termine' end,
    x.kind,
    case when x.completed_at is not null then x.score_correct::numeric end,
    case when x.completed_at is not null then x.qcm_count::numeric end,
    case when x.completed_at is not null and x.qcm_count > 0 then round(100.0 * x.score_correct / x.qcm_count, 1) end,
    case when x.completed_at is not null and x.started_at is not null then greatest(0, extract(epoch from (x.completed_at - x.started_at)))::integer end,
    x.qcm_count,
    true,
    case when jsonb_typeof(x.matiere_scores) = 'object' then jsonb_build_object('specialites_ratio', x.matiere_scores) else '{}'::jsonb end,
    x.archive_raison, x.archive_le, x.archive_motif, x.archive_auteur
  from transversale_all x

  union all
  -- Interrogations de fin d'item notées hors moteur d'épreuve (historique)
  select
    case when x.archive_id is null then 'interrogation_cours:' || x.id else 'archive:' || x.archive_id end,
    'interrogation_cours', x.id, x.archive_id, x.user_id,
    'interrogation',
    'Interrogation de fin d''item — ' || coalesce(c.titre, x.contexte ->> 'titre', 'item'),
    coalesce(c.matiere_id, x.contexte ->> 'specialite_id'), null::text,
    null::uuid, x.cours_id, null::integer,
    null::timestamptz, x.qcm_test_completed_at,
    'termine', 'termine',
    x.qcm_test_score::numeric, x.qcm_test_total::numeric,
    case when x.qcm_test_total > 0 then round(100.0 * x.qcm_test_score / x.qcm_test_total, 1) end,
    null::integer, x.qcm_test_total,
    true,
    '{}'::jsonb,
    x.archive_raison, x.archive_le, x.archive_motif, x.archive_auteur
  from interro_all x
  left join public.cours c on c.id = x.cours_id
)
select
  u.*,
  coalesce(u.fin, u.debut) as date_evaluation,
  u.archive_id is not null as archive,
  p.faculte_id, p.first_name, p.last_name, p.email, p.promotion,
  coalesce(u.voie, p.permission_scope ->> 'voie') as voie_candidat,
  -- Sous-collège : préfixé de son collège parent (« Médecine générale › Cardiologie »).
  case when pm.nom is not null then pm.nom || ' › ' || m.nom else m.nom end as specialite_nom
from unifie u
left join public.profiles p on p.id = u.user_id
left join public.matieres m on m.id = u.specialite_id
left join public.matieres pm on pm.id = m.parent_matiere_id;

revoke all on public.evaluations_historique from anon, authenticated;
grant select on public.evaluations_historique to service_role;

-- ─── 4. Fonctions admin (service-role seulement) ────────────────────────────

-- Correction d'une note DÉFINITIVE : motif obligatoire, auteur identifié ; les
-- déclencheurs écrivent l'ancienne et la nouvelle valeur dans le journal.
create or replace function public.admin_corriger_evaluation(
  p_source text, p_id uuid, p_score numeric, p_score_max numeric, p_band text, p_auteur uuid, p_motif text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_auteur is null then raise exception 'Auteur obligatoire'; end if;
  if coalesce(length(trim(p_motif)), 0) < 5 then raise exception 'Motif obligatoire (5 caractères au moins)'; end if;
  if p_score is null or p_score < 0 then raise exception 'Note invalide'; end if;
  if p_score_max is not null and (p_score_max <= 0 or p_score > p_score_max) then raise exception 'La note dépasse le maximum'; end if;
  perform set_config('app.eval_auteur', p_auteur::text, true);
  perform set_config('app.eval_motif', trim(p_motif), true);

  if p_source = 'checkup' then
    update checkup_sessions set
      points_obtained = p_score,
      points_possible = coalesce(p_score_max, points_possible),
      score_percent = round(100 * p_score / nullif(coalesce(p_score_max, points_possible), 0), 1)
    where id = p_id and status in ('completed', 'expired') and score_percent is not null;
  elsif p_source = 'epreuve' then
    update mock_exam_submissions set
      score = p_score,
      max_score = coalesce(p_score_max, max_score),
      percentage = round(100 * p_score / nullif(coalesce(p_score_max, max_score), 0))
    where id = p_id and status = 'graded';
  elsif p_source = 'parcours_major' then
    if p_score > 10 then raise exception 'Note sur 10'; end if;
    update major_parcours_completions set score = p_score, band = coalesce(p_band, band) where id = p_id;
  elsif p_source = 'transversale' then
    update transversal_sessions set score_correct = round(p_score)::integer, qcm_count = coalesce(round(p_score_max)::integer, qcm_count)
    where id = p_id and completed_at is not null and round(p_score) <= coalesce(round(p_score_max), qcm_count);
  elsif p_source = 'interrogation_cours' then
    update parcours_completions set qcm_test_score = round(p_score)::integer, qcm_test_total = coalesce(round(p_score_max)::integer, qcm_test_total)
    where id = p_id and qcm_test_completed_at is not null and round(p_score) <= coalesce(round(p_score_max), qcm_test_total);
  else
    raise exception 'Source inconnue : %', p_source;
  end if;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'Évaluation introuvable, non définitive ou note incohérente'; end if;
  return jsonb_build_object('ok', true);
end $$;

-- « Refaire l'épreuve » : la copie n'est plus effacée sans trace, elle est
-- archivée (réponses comprises) avec l'auteur et le motif.
create or replace function public.admin_reinitialiser_epreuve_eleve(p_exam uuid, p_user uuid, p_auteur uuid, p_motif text)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_auteur is null then raise exception 'Auteur obligatoire'; end if;
  perform set_config('app.eval_auteur', p_auteur::text, true);
  perform set_config('app.eval_motif', coalesce(nullif(trim(p_motif), ''), 'Épreuve réinitialisée par l''équipe : l''élève peut la repasser'), true);
  perform set_config('app.eval_raison', 'reinitialisation', true);
  delete from mock_exam_submissions where exam_id = p_exam and user_id = p_user;
  get diagnostics n = row_count;
  return n;
end $$;

-- Aucune de ces fonctions n'est appelable par un élève ou un visiteur.
do $$
declare f text;
begin
  foreach f in array array[
    'eval_trace_auteur()', 'eval_trace_motif()', 'eval_libelle(uuid)',
    'eval_noter_correction(text, uuid, uuid, text, jsonb, jsonb, uuid, text)',
    'eval_archiver(text, uuid, uuid, text, jsonb, jsonb)',
    'eval_note_copie_interrogation(uuid, uuid, timestamptz)',
    'eval_contexte_epreuve(uuid)',
    'admin_corriger_evaluation(text, uuid, numeric, numeric, text, uuid, text)',
    'admin_reinitialiser_epreuve_eleve(uuid, uuid, uuid, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;
