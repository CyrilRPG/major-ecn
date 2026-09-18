-- Gestion des accès collaborateurs — cahier des charges du 18/09/2026.
--
-- Le moteur de permissions (utilisateur → permissions → périmètre) vit dans
-- `profiles.permission_scope` (aucune colonne nouvelle : le JSON porte les
-- modules, le périmètre, la fonction, le rôle modèle et l'exigence 2FA ;
-- `is_active` et `access_end` existent déjà). Ce fichier apporte ce que le
-- JSON ne peut pas porter :
--
--  1. vidéos : un statut de publication (« À valider » / « Publiée ») et une
--     date de publication programmée, invisibles des élèves tant que la vidéo
--     n'est pas publiée (policy restrictive, donc valable pour TOUTES les
--     lectures élèves — web comme app mobile) ;
--  2. blog : la file « En attente de validation » (statut `pending`) ;
--  3. suivi : l'affectation des élèves aux collaborateurs, le statut de suivi
--     et la date du prochain contact (`suivi_followups`) ;
--  4. comptes rendus d'appel (`pedagogical_notes`) : historique NON
--     destructible — aucune mise à jour ni suppression possible, quel que soit
--     le client ; l'identité de l'auteur est figée dans la ligne.

-- ── 1. Vidéos : statut de publication ────────────────────────────────────────
alter table public.videos add column if not exists status text not null default 'publie';
alter table public.videos drop constraint if exists videos_status_check;
alter table public.videos add constraint videos_status_check check (status in ('publie', 'a_valider'));
alter table public.videos add column if not exists publish_at timestamptz;
alter table public.videos add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.videos add column if not exists published_by uuid references public.profiles(id) on delete set null;
alter table public.videos add column if not exists published_at timestamptz;
create index if not exists videos_status_idx on public.videos (status) where status <> 'publie';

-- Un élève ne lit que les vidéos publiées dont la date est atteinte. Policy
-- RESTRICTIVE : ANDée avec les policies existantes, donc impossible à
-- contourner par une autre policy permissive. Le personnel voit tout.
drop policy if exists videos_publiees_seulement on public.videos;
create policy videos_publiees_seulement on public.videos
  as restrictive for select
  using (
    (select public.current_role()) <> 'student'
    or (status = 'publie' and (publish_at is null or publish_at <= now()))
  );

-- ── 2. Blog : file « En attente de validation » ───────────────────────────────
alter table public.blog_posts drop constraint if exists blog_posts_status_check;
alter table public.blog_posts add constraint blog_posts_status_check check (status in ('draft', 'pending', 'published'));
alter table public.blog_posts add column if not exists submitted_at timestamptz;
alter table public.blog_posts add column if not exists submitted_by uuid;
alter table public.blog_posts add column if not exists updated_by uuid;
alter table public.blog_posts add column if not exists published_by uuid;

-- ── 3. Suivi : affectation, statut de suivi, prochain contact ─────────────────
create table if not exists public.suivi_followups (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  faculte_id text not null default 'major-ecn',
  assigned_to uuid references public.profiles(id) on delete set null,
  assigned_by uuid,
  assigned_at timestamptz,
  statut text not null default 'a_contacter'
    check (statut in ('a_contacter', 'contacte', 'a_rappeler', 'resolu', 'a_surveiller', 'urgent')),
  prochain_contact_at date,
  note text,
  updated_by uuid,
  updated_at timestamptz not null default now()
);
create index if not exists suivi_followups_assigned_idx on public.suivi_followups (assigned_to);
create index if not exists suivi_followups_statut_idx on public.suivi_followups (faculte_id, statut);
alter table public.suivi_followups enable row level security;
drop policy if exists suivi_followups_staff on public.suivi_followups;
create policy suivi_followups_staff on public.suivi_followups
  for all
  using ((select public.current_role()) in ('admin', 'professor'))
  with check ((select public.current_role()) in ('admin', 'professor'));
comment on table public.suivi_followups is
  'Suivi commercial/pédagogique par élève : collaborateur affecté, statut (à contacter, contacté, à rappeler, résolu, à surveiller, urgent), prochain contact.';

-- ── 4. Comptes rendus : historique non destructible ──────────────────────────
alter table public.pedagogical_notes add column if not exists author_name text;
alter table public.pedagogical_notes add column if not exists prochaine_relance_at date;

create or replace function public.pedagogical_notes_immuables()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Les comptes rendus sont un historique non destructible : ni modification ni suppression (cahier des charges 18/09/2026).';
end;
$$;

drop trigger if exists pedagogical_notes_immuables on public.pedagogical_notes;
create trigger pedagogical_notes_immuables
  before update or delete on public.pedagogical_notes
  for each row execute function public.pedagogical_notes_immuables();

-- Le personnel (professor) peut lire et écrire les comptes rendus depuis
-- l'application ; l'immutabilité est garantie par le trigger ci-dessus.
drop policy if exists pedagogical_notes_staff_read on public.pedagogical_notes;
create policy pedagogical_notes_staff_read on public.pedagogical_notes
  for select using ((select public.current_role()) in ('admin', 'professor'));
drop policy if exists pedagogical_notes_staff_insert on public.pedagogical_notes;
create policy pedagogical_notes_staff_insert on public.pedagogical_notes
  for insert with check ((select public.current_role()) in ('admin', 'professor'));
