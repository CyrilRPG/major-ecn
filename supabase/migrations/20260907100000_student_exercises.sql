-- Entraînements d'élèves : flashcards et QCM créés par les élèves eux-mêmes.
--
-- Un élève peut ajouter, depuis un item, une flashcard ou un QCM pour son
-- propre entraînement : le contenu n'est visible que de lui. L'équipe
-- pédagogique (admin et professeurs, dans leur périmètre) retrouve ces
-- propositions dans « Administration › Entraînements d'élèves » et peut,
-- d'un clic, les verser dans la base commune : la flashcard rejoint
-- `flashcards`, le QCM rejoint une série « Entraînement · Propositions
-- d'élèves » de l'item (`qcm_series` / `qcm_questions` / `qcm_items`). La
-- ligne d'origine garde la trace de la publication.
--
-- À APPLIQUER À LA MAIN dans l'éditeur SQL Supabase. Tant qu'elle ne l'est
-- pas, les écrans concernés affichent un message d'attente au lieu d'échouer.

create table if not exists public.student_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cours_id uuid not null references public.cours(id) on delete cascade,
  kind text not null check (kind in ('flashcard', 'qcm')),
  -- Flashcard (HTML assaini, comme `flashcards.recto/verso`).
  recto text,
  verso text,
  -- QCM : énoncé HTML, propositions [{lettre, enonce, is_correct, justification}], corrigé général.
  enonce text,
  items jsonb not null default '[]'::jsonb,
  correction_generale text,
  status text not null default 'private' check (status in ('private', 'published', 'rejected')),
  published_flashcard_id uuid references public.flashcards(id) on delete set null,
  published_question_id uuid references public.qcm_questions(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_exercises_shape check (
    (kind = 'flashcard' and recto is not null and verso is not null)
    or (kind = 'qcm' and enonce is not null)
  )
);

create index if not exists student_exercises_user_cours_idx on public.student_exercises(user_id, cours_id, created_at);
create index if not exists student_exercises_status_idx on public.student_exercises(status, created_at desc);
create index if not exists student_exercises_cours_idx on public.student_exercises(cours_id);

alter table public.student_exercises enable row level security;

-- L'élève : tout sur ses propres lignes. `(select auth.uid())` : évalué une
-- fois par requête (convention 20260803130000_rls_perf_auth_uid).
drop policy if exists student_exercises_owner on public.student_exercises;
create policy student_exercises_owner on public.student_exercises
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- L'équipe pédagogique : lecture et mise à jour (statut, publication). Le
-- périmètre collège/item d'un professeur est rejoué en application, comme pour
-- les autres contenus (les actions passent par le client service-role).
drop policy if exists student_exercises_staff_read on public.student_exercises;
create policy student_exercises_staff_read on public.student_exercises
  for select to authenticated
  using ((select public.current_role()) in ('admin', 'professor'));

drop policy if exists student_exercises_staff_update on public.student_exercises;
create policy student_exercises_staff_update on public.student_exercises
  for update to authenticated
  using ((select public.current_role()) in ('admin', 'professor'))
  with check ((select public.current_role()) in ('admin', 'professor'));

-- `updated_at` automatique, même mécanisme que les contenus.
create or replace function public.student_exercises_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;
drop trigger if exists student_exercises_touch on public.student_exercises;
create trigger student_exercises_touch
  before update on public.student_exercises
  for each row execute function public.student_exercises_touch();
