-- Révisions transversales : reprise d'une session sur un autre appareil (2026-09-28).
--
-- Signalement : une élève commence sa révision sur son téléphone, s'arrête au
-- milieu et, sur son ordinateur, repart de zéro. La session ne vivait que dans
-- l'état React : la liste des questions (tirée en partie au hasard), la
-- position et le score n'étaient écrits nulle part avant la fin.
--
-- Une ligne par (élève, type de session) EN COURS : la suite ordonnée des
-- questions servies, le nombre de questions déjà répondues et les scores
-- partiels. La page de session la relit avant de tirer une nouvelle suite ;
-- la ligne est supprimée à la fin de la session (qui, elle, s'inscrit comme
-- avant dans transversal_sessions).
--
-- Table à part plutôt qu'une ligne « completed_at is null » dans
-- transversal_sessions : le trigger de statistiques et les vues d'activité
-- comptent les lignes de cette table, une session en cours n'y a pas sa place.
--
-- Idempotent : peut être rejoué sans risque dans l'éditeur SQL.

create table if not exists public.transversal_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  -- [{ "id": question_id, "d": [serie_id, position, total] | null }], dans
  -- l'ordre de passage (un dossier progressif reste d'un seul tenant).
  suite jsonb not null,
  answered int not null default 0,
  score int not null default 0,
  per_cours jsonb not null default '{}'::jsonb,
  per_matiere jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);

alter table public.transversal_progress enable row level security;

drop policy if exists transversal_progress_self on public.transversal_progress;
create policy transversal_progress_self on public.transversal_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.transversal_progress to authenticated;

notify pgrst, 'reload schema';
