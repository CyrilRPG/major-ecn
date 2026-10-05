-- =============================================
-- Émargement PAR SÉANCE (05/10/2026, demande de Cyril)
--
-- Une feuille valait jusqu'ici pour un item entier (élève, cours, type) : un
-- item « Replays - Révisions » de dix séances n'avait qu'une feuille vidéo, et
-- les neuf autres séances pouvaient être regardées sans signer. Chaque vidéo
-- visionnée doit désormais avoir SA feuille, traçable.
--
--   video_id    : la séance (public.videos) émargée. NULL = feuille « à
--                 l'item » antérieure à ce changement (ou app mobile qui ne
--                 transmet pas encore la séance).
--   video_titre : instantané du titre — la feuille reste lisible si la vidéo
--                 est renommée ou supprimée (d'où l'absence de clé étrangère).
--
-- Unicité : une feuille par (élève, cours, type, séance), la feuille à l'item
-- (video_id NULL) restant unique elle aussi.
-- =============================================

alter table public.course_attendances
  add column if not exists video_id uuid,
  add column if not exists video_titre text;

comment on column public.course_attendances.video_id is
  'Séance (videos.id) émargée ; NULL = feuille à l''item (antérieure au 05/10/2026 ou app mobile).';
comment on column public.course_attendances.video_titre is
  'Instantané du titre de la séance au moment où l''émargement est devenu dû.';

alter table public.course_attendances
  drop constraint if exists course_attendances_user_cours_kind_key;

create unique index if not exists course_attendances_user_cours_kind_video_key
  on public.course_attendances (
    user_id, cours_id, kind,
    coalesce(video_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
