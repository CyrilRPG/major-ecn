-- =============================================================================
-- « Questions à revoir » : favoris d'un élève sur des questions de QCM/QROC.
--   • Une étoile dans le dossier enregistre la question ici.
--   • L'onglet « Questions à revoir » liste ces questions.
-- =============================================================================

create table if not exists public.student_saved_questions (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.qcm_questions(id) on delete cascade,
  -- dénormalisé pour l'affichage/lien rapide dans la page « À revoir »
  serie_id uuid references public.qcm_series(id) on delete cascade,
  cours_id uuid references public.cours(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists student_saved_questions_user_idx
  on public.student_saved_questions(user_id, created_at desc);

alter table public.student_saved_questions enable row level security;

drop policy if exists student_saved_questions_owner on public.student_saved_questions;
create policy student_saved_questions_owner on public.student_saved_questions
  for all
  using (user_id = auth.uid() or public.current_role() = 'admin')
  with check (user_id = auth.uid());
