-- Index de performance — 2e passe. Cible les scans par utilisateur et les
-- jointures par cours les plus lourds (tableau de bord /accueil, layout étudiant,
-- navigator). Non-fonctionnels : ils n'accélèrent que les requêtes, sans changer
-- aucun résultat rendu. Tous en `if not exists` → réentrants.

-- Historique QCM/flashcards de l'élève (les 2 plus gros scans du dashboard).
create index if not exists qcm_attempts_user_idx
  on public.qcm_attempts (user_id);
create index if not exists qcm_attempts_user_attempted_idx
  on public.qcm_attempts (user_id, attempted_at desc);
create index if not exists flashcard_reviews_user_idx
  on public.flashcard_reviews (user_id);
create index if not exists flashcard_reviews_user_reviewed_idx
  on public.flashcard_reviews (user_id, reviewed_at desc);

-- Progression de cours (delta hebdo + portes de redirection du layout).
create index if not exists course_progress_user_idx
  on public.course_progress (user_id);
create index if not exists course_progress_user_seen_idx
  on public.course_progress (user_id, last_seen_at desc);

-- Jointures « contenu par cours » du navigator (fiche/vidéo/QCM/flashcards).
create index if not exists fiches_cours_idx
  on public.fiches (cours_id);
create index if not exists videos_cours_idx
  on public.videos (cours_id);
create index if not exists qcm_series_cours_idx
  on public.qcm_series (cours_id);
create index if not exists flashcards_cours_idx
  on public.flashcards (cours_id);

-- Jointure qcm_questions → série (agrégations dashboard + interrogation).
create index if not exists qcm_questions_serie_idx
  on public.qcm_questions (serie_id);
