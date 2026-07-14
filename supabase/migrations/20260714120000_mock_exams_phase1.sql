-- Module « Épreuves Blanches EVC » — Phase 1 (tables + RLS).
-- Sécurité concours : les questions ne sont JAMAIS lisibles en RLS par un élève
-- (réponses/corrigés). La passation passe par une server action (service-role)
-- qui assainit les questions ; la correction est faite côté serveur.

create table if not exists public.mock_exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  college_id text references public.matieres(id) on delete set null,
  duration_minutes int,
  instructions text not null default '',
  qcm_bareme_mode text not null default 'classic' check (qcm_bareme_mode in ('classic','custom','discordance')),
  discordance_table jsonb not null default '[]'::jsonb,
  qroc_mode text not null default 'self' check (qroc_mode in ('self','ai')),
  question_order text not null default 'fixed' check (question_order in ('fixed','random')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  publish_at timestamptz,
  -- Ciblage audience (vide = tous ceux qui remplissent les autres critères)
  min_offer text check (min_offer in ('essentiel','intensif','approfondi')),
  target_colleges text[] not null default '{}',
  voies text[] not null default '{}',
  target_promos text[] not null default '{}',
  -- Programmation (Phase 3)
  exam_mode text not null default 'free' check (exam_mode in ('free','scheduled')),
  open_at timestamptz,
  close_at timestamptz,
  results_publish_mode text not null default 'immediate' check (results_publish_mode in ('immediate','after_close','at_datetime')),
  results_publish_at timestamptz,
  absence_mode text not null default 'zero' check (absence_mode in ('zero','rattrapage')),
  rattrapage_open_at timestamptz,
  rattrapage_close_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mock_exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.mock_exams(id) on delete cascade,
  order_index int not null default 0,
  format text not null default 'qcm' check (format in ('qcm','qroc')),
  enonce text not null default '',
  vignette text,
  correction_generale text,
  images jsonb not null default '[]'::jsonb,
  points numeric not null default 1,
  college_id text,
  source_question_id uuid,
  -- QCM : items A-E
  items jsonb not null default '[]'::jsonb,
  -- QROC auto-évaluation
  reponse_attendue text,
  -- QROC correction IA (Phase 2)
  keywords jsonb not null default '[]'::jsonb,
  zero_if_missing jsonb not null default '[]'::jsonb,
  major_errors jsonb not null default '[]'::jsonb,
  corrige_complet text,
  created_at timestamptz not null default now()
);
create index if not exists mock_exam_questions_exam on public.mock_exam_questions(exam_id, order_index);

create table if not exists public.mock_exam_submissions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.mock_exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress','submitted','graded','absent')),
  score numeric not null default 0,
  max_score numeric not null default 0,
  percentage numeric not null default 0,
  time_spent_seconds int not null default 0,
  per_college jsonb not null default '{}'::jsonb,
  ai_report jsonb,
  graded_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists mock_exam_one_inprogress on public.mock_exam_submissions(exam_id, user_id) where status='in_progress';
create index if not exists mock_exam_submissions_exam on public.mock_exam_submissions(exam_id);
create index if not exists mock_exam_submissions_user on public.mock_exam_submissions(user_id);

create table if not exists public.mock_exam_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.mock_exam_submissions(id) on delete cascade,
  question_id uuid not null references public.mock_exam_questions(id) on delete cascade,
  format text not null default 'qcm',
  selected_items jsonb not null default '[]'::jsonb,
  text_answer text,
  is_correct boolean,
  discordances int,
  points_awarded numeric not null default 0,
  max_points numeric not null default 0,
  self_grade text check (self_grade in ('correct','partial','incorrect')),
  ai_grade jsonb,
  created_at timestamptz not null default now(),
  unique(submission_id, question_id)
);

-- ─── RLS ───
alter table public.mock_exams enable row level security;
alter table public.mock_exam_questions enable row level security;
alter table public.mock_exam_submissions enable row level security;
alter table public.mock_exam_answers enable row level security;

create policy mock_exams_admin_all on public.mock_exams
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy mock_exams_read_published on public.mock_exams
  for select using (status = 'published');

-- Questions : JAMAIS lisibles par un élève en direct (contiennent les réponses).
create policy mock_exam_questions_admin_all on public.mock_exam_questions
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- Copies : propriétaire (lecture) ou admin. Écriture via service-role (server actions).
create policy mock_exam_submissions_owner_read on public.mock_exam_submissions
  for select using (user_id = auth.uid() or public.current_role() = 'admin');
create policy mock_exam_answers_owner_read on public.mock_exam_answers
  for select using (
    exists (
      select 1 from public.mock_exam_submissions s
      where s.id = submission_id and (s.user_id = auth.uid() or public.current_role() = 'admin')
    )
  );
