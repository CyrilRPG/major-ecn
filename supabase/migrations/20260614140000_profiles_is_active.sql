-- =============================================================================
-- Migration : ajouter un drapeau `is_active` sur profiles pour permettre à
--             l'admin d'activer/désactiver un compte sans le supprimer.
--             Le mot de passe d'origine reste valide après réactivation.
-- =============================================================================

alter table public.profiles
  add column if not exists is_active boolean not null default true;

-- Index pour filtrer rapidement les comptes désactivés.
create index if not exists profiles_is_active_idx
  on public.profiles(is_active) where is_active = false;

comment on column public.profiles.is_active is
  'Si false, l''utilisateur est redirigé vers /login lors de toute requête (compte désactivé par l''admin). Réactiver remet l''accès, le mot de passe d''origine reste valide.';
