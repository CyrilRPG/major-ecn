-- Sections 9-15 du cahier des charges: évaluations officielles, consolidation,
-- renforcement approfondi, alertes admin, CRM pédagogique.
-- Appliquée directement via Supabase le 2026-06-29.

CREATE TABLE IF NOT EXISTS public.specialty_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matiere_id text NOT NULL,
  eval_type text NOT NULL CHECK (eval_type IN ('fin_specialite','consolidation_mini_eval','renforcement_eval','reevaluation')),
  score_correct int NOT NULL,
  score_total int NOT NULL,
  status text NOT NULL CHECK (status IN ('validee','fragile','insuffisante')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consolidation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matiere_id text NOT NULL,
  phase text NOT NULL DEFAULT 'qcm' CHECK (phase IN ('qcm','mini_eval')),
  qcm_count int NOT NULL DEFAULT 0,
  score_correct int NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.renforcement_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matiere_id text NOT NULL,
  current_step int NOT NULL DEFAULT 1,
  fiches_completed boolean NOT NULL DEFAULT false,
  flashcards_completed boolean NOT NULL DEFAULT false,
  qcm_completed boolean NOT NULL DEFAULT false,
  qcm_score int,
  qcm_total int,
  eval_completed boolean NOT NULL DEFAULT false,
  eval_score int,
  eval_total int,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  priority int NOT NULL CHECK (priority IN (1, 2)),
  motif text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.pedagogical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_type text NOT NULL CHECK (contact_type IN ('telephone','visio','email','whatsapp')),
  motif text NOT NULL,
  observations text,
  difficultes text,
  actions_recommandees text,
  relance_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
