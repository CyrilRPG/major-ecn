-- =====================================================================
-- Suivi individuel — relances automatiques paramétrables (§14, cahier V4)
-- ---------------------------------------------------------------------
-- Le délai et le nombre maximal de relances automatiques « invité sans
-- réservation » étaient codés en dur dans le cron (3 jours, 2 relances).
-- Ils deviennent des réglages du module, comme le rappel avant rendez-vous.
-- Sans risque à relancer.
-- =====================================================================
alter table public.suivi_settings
  add column if not exists auto_relance_enabled boolean not null default true,
  add column if not exists auto_relance_days    int     not null default 3 check (auto_relance_days between 1 and 60),
  add column if not exists auto_relance_max     int     not null default 2 check (auto_relance_max between 0 and 10);
