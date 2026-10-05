-- ═══════════════════════════════════════════════════════════════════════════
-- EVC CHECK-UP — évaluation personnalisée, chronométrée, analyse par item
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Cahier des charges définitif « EVC Check-up » + complément « Sources de
-- questions : banques structurées, DES, transversales et annales EVC ».
--
-- Une évaluation = une ligne `checkup_sessions` (evaluation_id) ; ses
-- questions sont FIGÉES à la composition (`checkup_questions.snapshot`) :
-- une correction ou une suppression ultérieure de la banque ne réécrit jamais
-- l'historique, et les bonnes réponses ne quittent jamais le serveur avant la
-- soumission. Chronomètre côté serveur (`deadline_at`), une seule session
-- active par candidat (index unique partiel), appareil de départ mémorisé.
--
-- Statuts (§33) : active ; expired ; pending_self_review ; completed ;
-- abandoned ; cancelled_technical.
--
-- Migration ADDITIVE. Sans risque à relancer.

create table if not exists public.checkup_sessions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  faculte_id              text not null default 'major-ecn',
  voie                    text not null check (voie in ('interne', 'externe')),
  specialite_id           text not null references public.matieres(id),
  mode                    text not null check (mode in ('global', 'categories', 'items')),
  scope_kind              text not null check (scope_kind in ('global', 'cible')),
  category_ids            text[] not null default '{}',
  item_ids                uuid[] not null default '{}',
  format                  text not null check (format in ('interne_40_60', 'externe_3_60', 'externe_5_120')),
  planned_seconds         int not null check (planned_seconds > 0),
  question_count          int not null check (question_count > 0),
  block_count             int,
  started_at              timestamptz not null default now(),
  deadline_at             timestamptz not null,
  submitted_at            timestamptz,
  ended_reason            text check (ended_reason is null or ended_reason in ('submitted', 'expired', 'abandoned', 'cancelled_technical')),
  status                  text not null default 'active'
                            check (status in ('active', 'expired', 'pending_self_review', 'completed', 'abandoned', 'cancelled_technical')),
  self_review_completed_at timestamptz,
  completed_at            timestamptz,
  duration_seconds        int,
  score_percent           numeric(5,2),
  points_obtained         numeric(7,2),
  points_possible         numeric(7,2),
  qcm_points_obtained     numeric(7,2),
  qcm_points_possible     numeric(7,2),
  device_id               text not null,
  alerts_sent             int[] not null default '{}',
  composition             jsonb not null default '{}'::jsonb,
  results                 jsonb,
  recommendations         jsonb,
  actions                 jsonb not null default '[]'::jsonb,
  neutralized_by          uuid references auth.users(id) on delete set null,
  neutralized_reason      text,
  neutralized_at          timestamptz,
  qcm_signals_emitted_at  timestamptz,
  signals_emitted_at      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
-- Une seule session ACTIVE par candidat (§28).
create unique index if not exists checkup_sessions_one_active on public.checkup_sessions (user_id) where status = 'active';
create index if not exists checkup_sessions_user_idx on public.checkup_sessions (user_id, started_at desc);
create index if not exists checkup_sessions_active_deadline_idx on public.checkup_sessions (deadline_at) where status = 'active';
create index if not exists checkup_sessions_status_idx on public.checkup_sessions (status, started_at desc);

create table if not exists public.checkup_questions (
  id                     uuid primary key default gen_random_uuid(),
  session_id             uuid not null references public.checkup_sessions(id) on delete cascade,
  position               int not null,
  block_index            int not null default 0,
  dossier_id             uuid,
  question_order         int,
  dossier_size           int,
  question_id            uuid references public.qcm_questions(id) on delete set null,
  canonical_question_id  uuid not null,
  content_source         text not null check (content_source in ('structured_item', 'des_bank', 'transversal_bank', 'evc_annale')),
  item_id                uuid references public.cours(id) on delete set null,
  category_id            text,
  speciality_id          text not null,
  priority_level         smallint,
  question_type          text not null check (question_type in ('QRU', 'QRM', 'QROC')),
  annale_year            int,
  snapshot               jsonb not null,
  presented_at           timestamptz,
  answer                 jsonb,
  answered_at            timestamptz,
  marked_review          boolean not null default false,
  locked_at              timestamptz,
  self_grade             text check (self_grade is null or self_grade in ('correct', 'partial', 'incorrect')),
  self_graded_at         timestamptz,
  result                 text check (result is null or result in ('correct', 'partial', 'incorrect')),
  points                 numeric(4,2),
  discordances           int,
  origin                 text check (origin is null or origin in ('auto', 'auto_evaluee', 'vide')),
  seen_before            boolean not null default false,
  days_since_last_seen   int,
  signal_strength        text,
  unique (session_id, position)
);
create index if not exists checkup_questions_session_idx on public.checkup_questions (session_id, position);
create index if not exists checkup_questions_question_idx on public.checkup_questions (question_id);
create index if not exists checkup_questions_canonical_idx on public.checkup_questions (canonical_question_id);

-- updated_at
drop trigger if exists checkup_sessions_touch on public.checkup_sessions;
create trigger checkup_sessions_touch before update on public.checkup_sessions
  for each row execute function public.pedago_touch_updated_at();

-- RLS : les questions figées contiennent les corrections → administrateur
-- seulement ; le candidat lit ses sessions (résumé), jamais les snapshots en direct.
alter table public.checkup_sessions enable row level security;
alter table public.checkup_questions enable row level security;
drop policy if exists checkup_sessions_admin_all on public.checkup_sessions;
create policy checkup_sessions_admin_all on public.checkup_sessions for all
  using ((select public.current_role()) = 'admin') with check ((select public.current_role()) = 'admin');
drop policy if exists checkup_sessions_self_read on public.checkup_sessions;
create policy checkup_sessions_self_read on public.checkup_sessions for select using (user_id = (select auth.uid()));
drop policy if exists checkup_questions_admin_all on public.checkup_questions;
create policy checkup_questions_admin_all on public.checkup_questions for all
  using ((select public.current_role()) = 'admin') with check ((select public.current_role()) = 'admin');
