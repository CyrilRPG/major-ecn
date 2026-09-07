-- =====================================================================
-- EVC Arena — module de tournoi de QCM (cahier des charges 09/2026)
-- ---------------------------------------------------------------------
-- Toutes les tables sont cloisonnées par faculté (projet Supabase partagé
-- avec Major Odontologie) et réservées à l'administration côté RLS : les
-- participants n'ont PAS de compte Supabase Auth, ils sont servis par le
-- serveur (service role) après vérification d'un cookie de session signé.
-- Sans risque à relancer (if not exists / drop policy if exists).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Modèles de barème enregistrés (§6.7)
-- ---------------------------------------------------------------------
create table if not exists public.arena_bareme_templates (
  id            uuid primary key default gen_random_uuid(),
  faculte_id    text not null default 'major-ecn',
  name          text not null,
  question_type text not null check (question_type in ('QRM','QRU','QRP')),
  config        jsonb not null,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tournois (§15.1 : statut explicite, journalisé)
-- ---------------------------------------------------------------------
create table if not exists public.arena_tournaments (
  id                     uuid primary key default gen_random_uuid(),
  faculte_id             text not null default 'major-ecn',
  slug                   text not null,
  title                  text not null,
  edition_label          text not null default '',
  specialty              text not null,
  specialty_id           text references public.matieres(id) on delete set null,
  status                 text not null default 'draft'
    check (status in ('draft','scheduled','registration_open','round_open','round_closed','finished','archived')),
  indexable              boolean not null default false,
  meta_title             text,
  meta_description       text,
  intro_text             text not null default '',
  og_image_path          text,
  leaderboard_enabled    boolean not null default true,
  leaderboard_size       int not null default 10 check (leaderboard_size between 1 and 50),
  threshold_pct          numeric not null default 50 check (threshold_pct between 0 and 100),
  min_rounds_final       int not null default 2 check (min_rounds_final >= 1),
  questions_per_round    int not null default 12 check (questions_per_round between 1 and 100),
  round_duration_minutes int not null default 12 check (round_duration_minutes between 1 and 240),
  retention_days         int not null default 365 check (retention_days >= 30),
  bareme                 jsonb not null default '{}'::jsonb,
  email_sequence         jsonb not null default '{}'::jsonb,
  texts                  jsonb not null default '{}'::jsonb,
  created_by             uuid references auth.users(id) on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (faculte_id, slug)
);

comment on column public.arena_tournaments.bareme is
  'Barème par type de question : {"QRM":{"mode":"cng"|"all_or_nothing"|"custom","grid":…},"QRU":…,"QRP":…}. Copié dans arena_rounds.bareme_snapshot à l''ouverture de chaque manche (§6.10).';
comment on column public.arena_tournaments.email_sequence is
  'Séquence d''emails automatiques (§11) : {"j7":{"enabled":true},"j1":{…},"opening":{…},"relance":{…},"results":{…,"delay_minutes":0}}.';
comment on column public.arena_tournaments.texts is
  'Textes éditables (bandeau règles, message d''invitation). Les avertissements obligatoires (§9) ne sont pas modifiables.';

-- ---------------------------------------------------------------------
-- Manches (§2.1 : dates libres, fenêtre paramétrable)
-- ---------------------------------------------------------------------
create table if not exists public.arena_rounds (
  id                            uuid primary key default gen_random_uuid(),
  tournament_id                 uuid not null references public.arena_tournaments(id) on delete cascade,
  number                        int not null check (number between 1 and 10),
  theme                         text not null default '',
  opens_at                      timestamptz,
  closes_at                     timestamptz,
  duration_minutes              int check (duration_minutes between 1 and 240),
  bareme_snapshot               jsonb,
  bareme_locked_at              timestamptz,
  results_published_at          timestamptz,
  results_publish_delay_minutes int not null default 0 check (results_publish_delay_minutes >= 0),
  corrections_intro             text not null default '',
  corrections_methodo           text not null default '',
  corrections_errors            text not null default '',
  corrections_references        text not null default '',
  corrections_pdf_path          text,
  corrections_pdf_source        text check (corrections_pdf_source in ('generated','uploaded')),
  corrections_pdf_generated_at  timestamptz,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  unique (tournament_id, number),
  check (opens_at is null or closes_at is null or closes_at > opens_at)
);

-- ---------------------------------------------------------------------
-- Questions d'une manche (§6.2, §6.9, §6.11, §10)
-- ---------------------------------------------------------------------
create table if not exists public.arena_questions (
  id                  uuid primary key default gen_random_uuid(),
  round_id            uuid not null references public.arena_rounds(id) on delete cascade,
  order_index         int not null default 0,
  type                text not null check (type in ('QRM','QRU','QRP')),
  expected_count      int check (expected_count is null or expected_count >= 1),
  weight              numeric not null default 1 check (weight > 0),
  enonce              text not null default '',
  vignette            text,
  images              jsonb not null default '[]'::jsonb,
  items               jsonb not null default '[]'::jsonb,
  explanation         text not null default '',
  pieges              text not null default '',
  erreurs_frequentes  text not null default '',
  references_text     text not null default '',
  source_question_id  uuid,
  neutralized_at      timestamptz,
  neutralized_reason  text,
  neutralized_by      uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists arena_questions_round_idx on public.arena_questions(round_id, order_index);

comment on column public.arena_questions.items is
  'Propositions figées : [{"lettre":"A","enonce":"…","is_correct":true,"indispensable":false,"inacceptable":false,"justification":"…"}]. Une proposition ne peut être à la fois indispensable et inacceptable (contrôle à l''import).';

-- ---------------------------------------------------------------------
-- Participants (§3) — identité propre, sans compte Auth
-- ---------------------------------------------------------------------
create table if not exists public.arena_participants (
  id                          uuid primary key default gen_random_uuid(),
  faculte_id                  text not null default 'major-ecn',
  tournament_id               uuid not null references public.arena_tournaments(id) on delete cascade,
  first_name                  text not null,
  last_name                   text not null,
  email                       text not null,
  specialty                   text not null,
  pseudo                      text not null,
  pseudo_key                  text not null,
  avatar_seed                 text not null,
  timezone                    text,
  email_confirmed_at          timestamptz,
  confirmation_token_hash     text,
  confirmation_sent_at        timestamptz,
  login_token_hash            text,
  login_token_expires_at      timestamptz,
  consent_tournament_at       timestamptz not null default now(),
  consent_tournament_version  text not null,
  consent_marketing           boolean not null default false,
  consent_marketing_at        timestamptz,
  consent_marketing_version   text,
  marketing_unsubscribed_at   timestamptz,
  acquisition_source          text,
  utm                         jsonb,
  invited_by                  uuid references public.arena_participants(id) on delete set null,
  invite_code                 text not null,
  blocked_at                  timestamptz,
  blocked_reason              text,
  anonymized_at               timestamptz,
  last_login_at               timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  unique (tournament_id, email),
  unique (tournament_id, pseudo_key),
  unique (invite_code)
);
create index if not exists arena_participants_tournament_idx on public.arena_participants(tournament_id);
create index if not exists arena_participants_confirmation_idx on public.arena_participants(confirmation_token_hash) where confirmation_token_hash is not null;
create index if not exists arena_participants_login_idx on public.arena_participants(login_token_hash) where login_token_hash is not null;

-- ---------------------------------------------------------------------
-- Tentatives (une par participant et par manche — §2.1) et réponses
-- ---------------------------------------------------------------------
create table if not exists public.arena_attempts (
  id               uuid primary key default gen_random_uuid(),
  round_id         uuid not null references public.arena_rounds(id) on delete cascade,
  participant_id   uuid references public.arena_participants(id) on delete cascade,
  is_preview       boolean not null default false,
  preview_user_id  uuid references auth.users(id) on delete cascade,
  started_at       timestamptz not null default now(),
  deadline_at      timestamptz not null,
  truncated        boolean not null default false,
  submitted_at     timestamptz,
  status           text not null default 'in_progress' check (status in ('in_progress','submitted','expired')),
  score            numeric,
  max_score        numeric,
  perfect_count    int,
  duration_seconds int,
  question_order   uuid[] not null default '{}'::uuid[],
  created_at       timestamptz not null default now(),
  check ((is_preview and participant_id is null and preview_user_id is not null)
      or (not is_preview and participant_id is not null))
);
create unique index if not exists arena_attempts_one_per_round
  on public.arena_attempts(round_id, participant_id) where participant_id is not null;
create unique index if not exists arena_attempts_one_preview
  on public.arena_attempts(round_id, preview_user_id) where is_preview;
create index if not exists arena_attempts_open_idx on public.arena_attempts(deadline_at) where status = 'in_progress';

create table if not exists public.arena_answers (
  id             uuid primary key default gen_random_uuid(),
  attempt_id     uuid not null references public.arena_attempts(id) on delete cascade,
  question_id    uuid not null references public.arena_questions(id) on delete cascade,
  selected       text[] not null default '{}'::text[],
  validated_at   timestamptz not null default now(),
  score          numeric,
  max_score      numeric,
  discordances   int,
  is_perfect     boolean,
  rule_triggered text,
  unique (attempt_id, question_id)
);

-- ---------------------------------------------------------------------
-- Signalements (§10.1)
-- ---------------------------------------------------------------------
create table if not exists public.arena_reports (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null references public.arena_questions(id) on delete cascade,
  participant_id  uuid not null references public.arena_participants(id) on delete cascade,
  motif           text not null check (motif in ('erreur_medicale','enonce_ambigu','reponse_contestable','recommandation_obsolete','autre')),
  comment         text not null default '',
  reference       text,
  status          text not null default 'open' check (status in ('open','validated','rejected')),
  admin_response  text,
  handled_at      timestamptz,
  handled_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (question_id, participant_id)
);

-- ---------------------------------------------------------------------
-- Journal des emails (§11 — traçabilité, dédoublonnage) et journal du tournoi
-- ---------------------------------------------------------------------
create table if not exists public.arena_emails (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid references public.arena_tournaments(id) on delete cascade,
  participant_id  uuid references public.arena_participants(id) on delete cascade,
  round_id        uuid references public.arena_rounds(id) on delete set null,
  kind            text not null,
  dedupe_key      text,
  subject         text,
  to_email        text,
  sent_at         timestamptz not null default now(),
  resend_id       text,
  error           text,
  triggered_by    uuid references auth.users(id) on delete set null
);
create unique index if not exists arena_emails_dedupe_idx on public.arena_emails(dedupe_key) where dedupe_key is not null;
create index if not exists arena_emails_participant_idx on public.arena_emails(participant_id, sent_at desc);

create table if not exists public.arena_log (
  id             uuid primary key default gen_random_uuid(),
  tournament_id  uuid references public.arena_tournaments(id) on delete cascade,
  round_id       uuid references public.arena_rounds(id) on delete set null,
  actor_id       uuid references auth.users(id) on delete set null,
  actor_label    text,
  kind           text not null,
  old_value      jsonb,
  new_value      jsonb,
  details        text,
  created_at     timestamptz not null default now()
);
create index if not exists arena_log_tournament_idx on public.arena_log(tournament_id, created_at desc);

-- ---------------------------------------------------------------------
-- updated_at automatique
-- ---------------------------------------------------------------------
create or replace function public.arena_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
declare t text;
begin
  foreach t in array array['arena_bareme_templates','arena_tournaments','arena_rounds','arena_questions','arena_participants']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.arena_touch_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- RLS : administration uniquement. Le public et les participants passent
-- exclusivement par le serveur (service role), qui filtre ce qu'il expose.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['arena_bareme_templates','arena_tournaments','arena_rounds','arena_questions',
                           'arena_participants','arena_attempts','arena_answers','arena_reports','arena_emails','arena_log']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format('create policy %I_admin_all on public.%I for all using (public.current_role() = ''admin'') with check (public.current_role() = ''admin'')', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Stockage privé (PDF de corrections, images OG) — lecture par URL signée
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('arena', 'arena', false)
on conflict (id) do nothing;

drop policy if exists arena_storage_admin_all on storage.objects;
create policy arena_storage_admin_all on storage.objects for all to authenticated
  using (bucket_id = 'arena' and public.current_role() = 'admin')
  with check (bucket_id = 'arena' and public.current_role() = 'admin');
