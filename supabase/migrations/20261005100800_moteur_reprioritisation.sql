-- =====================================================================
-- Moteur pédagogique central — recalcul quotidien des priorités et suivi
-- de la date d'épreuve réellement utilisée par le moteur.
-- ---------------------------------------------------------------------
-- L'urgence (O§11) dépend du nombre de jours avant l'EVC : elle évolue
-- chaque jour. Quand la date d'épreuve change (§50, I§41), les
-- réactivations sont reprogrammées (jamais après l'épreuve, replacement
-- J-14 → J-3) et un recalcul du planning est demandé.
-- Sans risque à relancer.
-- =====================================================================

alter table public.pedago_collector_state
  add column if not exists exam_date_used       date,
  add column if not exists exam_date_checked_at timestamptz,
  add column if not exists reprioritized_on     date;
