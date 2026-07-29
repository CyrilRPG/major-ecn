-- =============================================
-- Feuilles d'émargement par cours
--
-- Obligation réglementaire (formation professionnelle) : l'étudiant qui a
-- commencé un cours doit émarger, même s'il ne l'a vu que partiellement.
--
-- Cycle de vie d'une ligne :
--   1. le lecteur vidéo atteint le seuil (20 % de la durée) → la ligne est
--      créée avec `required_at`, `signed_at` NULL : l'émargement est DÛ ;
--   2. l'étudiant signe à la main (tracé au doigt/souris) → `signed_at` et
--      `signature_png` sont renseignés.
--
-- Tant que `signed_at` est NULL, la page vidéo du cours reste bloquée — y
-- compris après un rechargement, puisque l'état vit en base et non côté client.
--
-- Distinct de `session_presences`, qui concerne les sessions Zoom live.
-- =============================================

create table public.course_attendances (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  cours_id        uuid not null references public.cours(id) on delete cascade,

  required_at     timestamptz not null default now(),
  signed_at       timestamptz,
  -- Signature manuscrite au format data URL (image/png). NULL tant que non signé.
  signature_png   text,

  -- Progression au moment du déclenchement (preuve du « vu, même en partie »).
  watched_ratio   numeric(5,4),
  watched_seconds integer,

  -- Instantanés : la feuille d'émargement doit rester lisible même si le cours
  -- est renommé ou supprimé plus tard.
  cours_titre     text,
  matiere_id      text,

  user_agent      text,

  -- Un seul émargement par cours et par étudiant.
  unique (user_id, cours_id)
);

comment on table public.course_attendances is
  'Feuilles d''émargement : un étudiant ayant commencé un cours doit le signer.';

create index course_attendances_user_idx    on public.course_attendances (user_id, required_at desc);
create index course_attendances_pending_idx on public.course_attendances (user_id) where signed_at is null;

alter table public.course_attendances enable row level security;

-- L'étudiant voit ses propres émargements ; l'admin voit tout.
create policy course_attendances_select on public.course_attendances
  for select using (user_id = auth.uid() or public.current_role() = 'admin');

-- L'étudiant ne peut créer qu'une ligne le concernant, et jamais pré-signée :
-- la signature passe obligatoirement par l'UPDATE ci-dessous.
create policy course_attendances_insert_own on public.course_attendances
  for insert with check (user_id = auth.uid() and signed_at is null and signature_png is null);

-- Signature : autorisée une seule fois (la clause USING interdit de repasser
-- sur une ligne déjà signée, donc de réécrire ou d'effacer une signature).
create policy course_attendances_sign_own on public.course_attendances
  for update using (user_id = auth.uid() and signed_at is null)
  with check (user_id = auth.uid());

create policy course_attendances_admin_all on public.course_attendances
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
