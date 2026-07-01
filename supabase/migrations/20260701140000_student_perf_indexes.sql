-- Index de performance pour les filtres par utilisateur les plus fréquents
-- (layout étudiant + dashboard + pages de révision). Non-fonctionnels : ils
-- n'accélèrent que les requêtes, sans changer aucun résultat rendu.

create index if not exists transversal_sessions_user_completed_idx
  on public.transversal_sessions (user_id, completed_at desc);
create index if not exists parcours_completions_user_idx
  on public.parcours_completions (user_id);
create index if not exists satisfaction_responses_user_idx
  on public.satisfaction_responses (user_id);
create index if not exists platform_time_tracking_user_date_idx
  on public.platform_time_tracking (user_id, session_date);
create index if not exists course_notes_user_cours_idx
  on public.course_notes (user_id, cours_id);
create index if not exists specialty_evaluations_user_idx
  on public.specialty_evaluations (user_id, created_at desc);
create index if not exists consolidation_sessions_user_idx
  on public.consolidation_sessions (user_id);
create index if not exists renforcement_progress_user_idx
  on public.renforcement_progress (user_id);
create index if not exists pedagogical_notes_user_idx
  on public.pedagogical_notes (user_id);
create index if not exists qcm_sessions_user_finished_idx
  on public.qcm_sessions (user_id, finished_at desc);
create index if not exists satisfaction_forms_active_idx
  on public.satisfaction_forms (active) where active = true;
