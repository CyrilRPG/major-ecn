-- 1) Blocs masqués par item : un item « Révisions - Psychiatrie » n'a pas
--    forcément de fiche éclair ni de DP/QI. L'administrateur choisit ce qui
--    s'affiche chez l'élève, item par item.
alter table public.cours
  add column if not exists hidden_blocks text[] not null default '{}';

-- 2) Popup d'accueil personnalisable par spécialité (college_id null = défaut).
--    Le popup « Bienvenue sur Major ECN » conseillait de commencer par les
--    spécialités transversales de médecine générale : hors sujet pour un élève
--    de psychiatrie. Il devient configurable, et désactivable.
create table if not exists public.welcome_popups (
  id uuid primary key default gen_random_uuid(),
  college_id text references public.matieres(id) on delete cascade,
  active boolean not null default true,
  titre text not null default 'Bienvenue sur Major ECN',
  accroche text not null default 'Comment bien démarrer votre préparation ?',
  intro text not null default 'Major ECN est la plateforme de référence pour vous préparer efficacement aux Épreuves de Vérification des Connaissances (EVC).',
  demarrage_actif boolean not null default true,
  demarrage_intro text not null default 'Si vous ne savez pas par où commencer, nous vous recommandons de débuter par les spécialités les plus transversales :',
  demarrage_colleges text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create unique index if not exists welcome_popups_college_uniq
  on public.welcome_popups (college_id) where college_id is not null;
create unique index if not exists welcome_popups_defaut_uniq
  on public.welcome_popups ((true)) where college_id is null;

alter table public.welcome_popups enable row level security;

drop policy if exists welcome_popups_read on public.welcome_popups;
create policy welcome_popups_read on public.welcome_popups
  for select to authenticated using (true);

drop policy if exists welcome_popups_admin on public.welcome_popups;
create policy welcome_popups_admin on public.welcome_popups
  for all to authenticated
  using (public."current_role"() = 'admin')
  with check (public."current_role"() = 'admin');
