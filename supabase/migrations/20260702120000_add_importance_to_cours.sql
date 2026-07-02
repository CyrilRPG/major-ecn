-- Importance pédagogique 0-5 (étoiles) réglée par l'admin sur chaque item (cours).
-- Par défaut 0 = non prioritaire.
alter table public.cours
  add column if not exists importance smallint not null default 0
  check (importance >= 0 and importance <= 5);

comment on column public.cours.importance is 'Importance pédagogique 0-5 (étoiles) réglée par l''admin. 0 = non prioritaire.';
