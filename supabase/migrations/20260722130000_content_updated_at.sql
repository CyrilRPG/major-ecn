-- =============================================
-- updated_at sur le contenu + propagation enfant→parent
--
-- Objectif : permettre au manifest de l'app mobile (delta ?since=) de détecter
-- les changements au grain cours/série. Toute modification d'un enfant
-- (question, item, flashcard, fiche, vidéo, série) « touche » son parent :
--   qcm_questions / qcm_items → qcm_series → cours
--   flashcards / fiches / videos → cours
-- =============================================

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

-- ---------------------------------------------
-- Colonnes + trigger touch (idempotent — fiches et course_notes ont déjà la colonne)
-- ---------------------------------------------
alter table public.cours         add column if not exists updated_at timestamptz not null default now();
alter table public.fiches        add column if not exists updated_at timestamptz not null default now();
alter table public.videos        add column if not exists updated_at timestamptz not null default now();
alter table public.qcm_series    add column if not exists updated_at timestamptz not null default now();
alter table public.qcm_questions add column if not exists updated_at timestamptz not null default now();
alter table public.qcm_items     add column if not exists updated_at timestamptz not null default now();
alter table public.flashcards    add column if not exists updated_at timestamptz not null default now();
alter table public.matieres      add column if not exists updated_at timestamptz not null default now();
alter table public.course_notes  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists cours_touch         on public.cours;
drop trigger if exists fiches_touch        on public.fiches;
drop trigger if exists videos_touch        on public.videos;
drop trigger if exists qcm_series_touch    on public.qcm_series;
drop trigger if exists qcm_questions_touch on public.qcm_questions;
drop trigger if exists qcm_items_touch     on public.qcm_items;
drop trigger if exists flashcards_touch    on public.flashcards;
drop trigger if exists matieres_touch      on public.matieres;
drop trigger if exists course_notes_touch  on public.course_notes;

create trigger cours_touch         before update on public.cours         for each row execute function public.touch_updated_at();
create trigger fiches_touch        before update on public.fiches        for each row execute function public.touch_updated_at();
create trigger videos_touch        before update on public.videos        for each row execute function public.touch_updated_at();
create trigger qcm_series_touch    before update on public.qcm_series    for each row execute function public.touch_updated_at();
create trigger qcm_questions_touch before update on public.qcm_questions for each row execute function public.touch_updated_at();
create trigger qcm_items_touch     before update on public.qcm_items     for each row execute function public.touch_updated_at();
create trigger flashcards_touch    before update on public.flashcards    for each row execute function public.touch_updated_at();
create trigger matieres_touch      before update on public.matieres      for each row execute function public.touch_updated_at();
create trigger course_notes_touch  before update on public.course_notes  for each row execute function public.touch_updated_at();

-- ---------------------------------------------
-- Propagation enfant → parent (triggers STATEMENT avec transition tables :
-- un import de 500 questions = 1 seul update de série, pas 500)
-- ---------------------------------------------
create or replace function public.touch_serie_from_questions() returns trigger
language plpgsql as $$
begin
  update public.qcm_series set updated_at = now()
  where id in (select distinct serie_id from changed);
  return null;
end; $$;

create or replace function public.touch_serie_from_items() returns trigger
language plpgsql as $$
begin
  update public.qcm_series set updated_at = now()
  where id in (
    select distinct q.serie_id
    from changed c join public.qcm_questions q on q.id = c.question_id
  );
  return null;
end; $$;

-- Générique pour tout enfant direct de cours (colonne cours_id).
create or replace function public.touch_cours_from_child() returns trigger
language plpgsql as $$
begin
  update public.cours set updated_at = now()
  where id in (select distinct cours_id from changed);
  return null;
end; $$;

-- qcm_questions → qcm_series
drop trigger if exists qcm_questions_bubble_ins on public.qcm_questions;
drop trigger if exists qcm_questions_bubble_upd on public.qcm_questions;
drop trigger if exists qcm_questions_bubble_del on public.qcm_questions;
create trigger qcm_questions_bubble_ins after insert on public.qcm_questions
  referencing new table as changed for each statement execute function public.touch_serie_from_questions();
create trigger qcm_questions_bubble_upd after update on public.qcm_questions
  referencing new table as changed for each statement execute function public.touch_serie_from_questions();
create trigger qcm_questions_bubble_del after delete on public.qcm_questions
  referencing old table as changed for each statement execute function public.touch_serie_from_questions();

-- qcm_items → qcm_series (via la question ; en DELETE d'item la question existe encore)
drop trigger if exists qcm_items_bubble_ins on public.qcm_items;
drop trigger if exists qcm_items_bubble_upd on public.qcm_items;
drop trigger if exists qcm_items_bubble_del on public.qcm_items;
create trigger qcm_items_bubble_ins after insert on public.qcm_items
  referencing new table as changed for each statement execute function public.touch_serie_from_items();
create trigger qcm_items_bubble_upd after update on public.qcm_items
  referencing new table as changed for each statement execute function public.touch_serie_from_items();
create trigger qcm_items_bubble_del after delete on public.qcm_items
  referencing old table as changed for each statement execute function public.touch_serie_from_items();

-- qcm_series / flashcards / fiches / videos → cours
drop trigger if exists qcm_series_bubble_ins on public.qcm_series;
drop trigger if exists qcm_series_bubble_upd on public.qcm_series;
drop trigger if exists qcm_series_bubble_del on public.qcm_series;
create trigger qcm_series_bubble_ins after insert on public.qcm_series
  referencing new table as changed for each statement execute function public.touch_cours_from_child();
create trigger qcm_series_bubble_upd after update on public.qcm_series
  referencing new table as changed for each statement execute function public.touch_cours_from_child();
create trigger qcm_series_bubble_del after delete on public.qcm_series
  referencing old table as changed for each statement execute function public.touch_cours_from_child();

drop trigger if exists flashcards_bubble_ins on public.flashcards;
drop trigger if exists flashcards_bubble_upd on public.flashcards;
drop trigger if exists flashcards_bubble_del on public.flashcards;
create trigger flashcards_bubble_ins after insert on public.flashcards
  referencing new table as changed for each statement execute function public.touch_cours_from_child();
create trigger flashcards_bubble_upd after update on public.flashcards
  referencing new table as changed for each statement execute function public.touch_cours_from_child();
create trigger flashcards_bubble_del after delete on public.flashcards
  referencing old table as changed for each statement execute function public.touch_cours_from_child();

drop trigger if exists fiches_bubble_ins on public.fiches;
drop trigger if exists fiches_bubble_upd on public.fiches;
drop trigger if exists fiches_bubble_del on public.fiches;
create trigger fiches_bubble_ins after insert on public.fiches
  referencing new table as changed for each statement execute function public.touch_cours_from_child();
create trigger fiches_bubble_upd after update on public.fiches
  referencing new table as changed for each statement execute function public.touch_cours_from_child();
create trigger fiches_bubble_del after delete on public.fiches
  referencing old table as changed for each statement execute function public.touch_cours_from_child();

drop trigger if exists videos_bubble_ins on public.videos;
drop trigger if exists videos_bubble_upd on public.videos;
drop trigger if exists videos_bubble_del on public.videos;
create trigger videos_bubble_ins after insert on public.videos
  referencing new table as changed for each statement execute function public.touch_cours_from_child();
create trigger videos_bubble_upd after update on public.videos
  referencing new table as changed for each statement execute function public.touch_cours_from_child();
create trigger videos_bubble_del after delete on public.videos
  referencing old table as changed for each statement execute function public.touch_cours_from_child();

-- Index pour les requêtes delta du manifest
create index if not exists cours_updated_at_idx      on public.cours (updated_at);
create index if not exists qcm_series_updated_at_idx on public.qcm_series (updated_at);
