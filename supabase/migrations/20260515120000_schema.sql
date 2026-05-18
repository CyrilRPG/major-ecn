-- =============================================
-- Hermione Médecine — Schema
-- =============================================
create extension if not exists "pgcrypto";

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','admin')),
  first_name text,
  last_name text,
  email text,
  phone text,
  promotion text,
  permission_scope jsonb not null default '{"type":"all"}'::jsonb,
  created_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles(role);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ACADEMIC
create table public.facultes (
  id text primary key, nom text not null, ville text not null,
  created_at timestamptz not null default now()
);
create table public.semestres (
  id text primary key,
  faculte_id text not null references public.facultes(id) on delete cascade,
  numero int not null check (numero in (1,2)),
  label text not null,
  created_at timestamptz not null default now()
);
create index semestres_faculte_idx on public.semestres(faculte_id);

create table public.matieres (
  id text primary key,
  semestre_id text not null references public.semestres(id) on delete cascade,
  nom text not null,
  icon_key text not null,
  color_hex text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index matieres_semestre_idx on public.matieres(semestre_id);

create table public.cours (
  id uuid primary key default gen_random_uuid(),
  matiere_id text not null references public.matieres(id) on delete cascade,
  titre text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index cours_matiere_idx on public.cours(matiere_id);

-- PEDAGOGICAL CONTENT
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid not null references public.cours(id) on delete cascade,
  titre text not null,
  storage_path text,
  duration_seconds int,
  created_at timestamptz not null default now()
);
create index videos_cours_idx on public.videos(cours_id);

create table public.fiches (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid not null references public.cours(id) on delete cascade,
  titre text not null,
  storage_path text,
  pages int,
  created_at timestamptz not null default now()
);
create index fiches_cours_idx on public.fiches(cours_id);

create table public.qcm_series (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid not null references public.cours(id) on delete cascade,
  type text not null check (type in ('qcm','annale')),
  label text not null,
  annee int,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index qcm_series_cours_idx on public.qcm_series(cours_id);
create index qcm_series_type_idx on public.qcm_series(type);

create table public.qcm_questions (
  id uuid primary key default gen_random_uuid(),
  serie_id uuid not null references public.qcm_series(id) on delete cascade,
  enonce text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index qcm_questions_serie_idx on public.qcm_questions(serie_id);

create table public.qcm_items (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.qcm_questions(id) on delete cascade,
  lettre text not null check (lettre in ('A','B','C','D','E')),
  enonce text not null,
  is_correct boolean not null default false,
  justification text not null default '',
  created_at timestamptz not null default now(),
  unique (question_id, lettre)
);
create index qcm_items_question_idx on public.qcm_items(question_id);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid not null references public.cours(id) on delete cascade,
  recto text not null,
  verso text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index flashcards_cours_idx on public.flashcards(cours_id);

-- STUDENT TRACKING
create table public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  difficulty text not null check (difficulty in ('tres_facile','facile','difficile','tres_difficile')),
  weight int not null check (weight between 1 and 4),
  reviewed_at timestamptz not null default now()
);
create index flashcard_reviews_user_card_idx on public.flashcard_reviews(user_id, flashcard_id);

create table public.qcm_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  serie_id uuid not null references public.qcm_series(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score_correct int not null default 0,
  score_total int not null default 0
);
create index qcm_sessions_user_idx on public.qcm_sessions(user_id);
create index qcm_sessions_serie_idx on public.qcm_sessions(serie_id);

create table public.qcm_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.qcm_sessions(id) on delete cascade,
  question_id uuid not null references public.qcm_questions(id) on delete cascade,
  selected_items jsonb not null default '[]'::jsonb,
  is_correct boolean not null default false,
  time_spent_seconds int,
  attempted_at timestamptz not null default now()
);
create index qcm_attempts_user_idx on public.qcm_attempts(user_id, attempted_at);
create index qcm_attempts_question_idx on public.qcm_attempts(question_id);
create index qcm_attempts_session_idx on public.qcm_attempts(session_id);

create table public.course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  cours_id uuid not null references public.cours(id) on delete cascade,
  video_watched boolean not null default false,
  fiche_read boolean not null default false,
  last_seen_at timestamptz not null default now(),
  primary key (user_id, cours_id)
);
create index course_progress_user_idx on public.course_progress(user_id);
