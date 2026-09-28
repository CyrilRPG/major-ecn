-- Planificateur — présentation animée à l'ouverture du module aux élèves (28/09/2026).
-- « Déjà vu » est gardé en base (et non dans le navigateur) : vue sur l'ordinateur,
-- elle ne réapparaît pas sur le téléphone. « Plus tard » la repousse de 3 jours,
-- au plus 3 fois ; créer son planning l'arrête définitivement.
alter table public.plan_profiles add column if not exists intro_seen_at timestamptz;
alter table public.plan_profiles add column if not exists intro_dismiss_count int not null default 0;
