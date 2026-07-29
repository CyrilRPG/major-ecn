-- =============================================
-- Type d'émargement vidéo plateforme
--
-- Un même cours peut donner lieu à deux visionnages distincts : la vidéo du
-- cours et la séance approfondie. Ce sont deux séances de formation
-- différentes, chacune doit donc être émargée séparément — d'où l'ajout de
-- `kind` à la clé d'unicité.
--
-- (Les émargements de sessions Zoom vivent dans `session_presences`, ils ne
-- sont pas concernés par cette table.)
-- =============================================

alter table public.course_attendances
  add column kind text not null default 'video'
    check (kind in ('video', 'seance'));

comment on column public.course_attendances.kind is
  'video = vidéo du cours ; seance = séance approfondie.';

-- Unicité par (élève, cours, type) et non plus par (élève, cours).
alter table public.course_attendances
  drop constraint course_attendances_user_id_cours_id_key;

alter table public.course_attendances
  add constraint course_attendances_user_cours_kind_key
    unique (user_id, cours_id, kind);
