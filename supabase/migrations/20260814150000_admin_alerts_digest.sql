-- ============================================================================
-- Alertes admin — passage à l'email RÉCAPITULATIF QUOTIDIEN (14/08/2026).
--
-- Les alertes restent créées en temps réel dans admin_alerts (page Alertes,
-- CRM, Candidats à contacter). L'email n'est plus envoyé alerte par alerte :
-- le cron quotidien /api/cron/pedagogical-alerts envoie UN récapitulatif des
-- alertes pas encore emailées, puis les marque via `emailed_at`.
-- ============================================================================

alter table public.admin_alerts
  add column if not exists emailed_at timestamptz;

-- Les alertes déjà existantes (emailées à la création sous l'ancien système)
-- ne doivent pas être reprises dans le premier récapitulatif.
update public.admin_alerts set emailed_at = created_at where emailed_at is null;

create index if not exists admin_alerts_not_emailed_idx
  on public.admin_alerts (created_at) where emailed_at is null;
