-- INCIDENT FIX (504 middleware / saturation CPU Postgres) :
-- la policy RLS de voie exécutait des sous-requêtes corrélées PAR LIGNE
-- (cours+matieres, sous-select titre) sur qcm_series. Sur les requêtes lisant
-- des milliers de séries (navigator, compteurs), cela saturait le CPU
-- (statement timeout) -> auth lente -> middleware.getUser() en timeout -> 504.
--
-- Correctif : deux colonnes booléennes précalculées (mg_series, is_revisions)
-- maintenues par trigger. La policy se réduit à des comparaisons de colonnes +
-- deux fonctions STABLE sans argument (évaluées une fois par requête).

alter table public.qcm_series add column if not exists mg_series boolean not null default false;
alter table public.qcm_series add column if not exists is_revisions boolean not null default false;

-- Recompute kind + drapeaux à l'insert/update d'une série.
create or replace function public.qcm_series_set_kind() returns trigger language plpgsql as $$
begin
  select coalesce(m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale', false),
         coalesce(c.titre like 'Révisions%', false)
    into new.mg_series, new.is_revisions
    from public.cours c join public.matieres m on m.id = c.matiere_id
    where c.id = new.cours_id;
  new.mg_series := coalesce(new.mg_series, false);
  new.is_revisions := coalesce(new.is_revisions, false);
  if new.type is distinct from 'qcm' then
    new.kind := null;
    return new;
  end if;
  new.kind := case
    when exists (select 1 from public.qcm_questions q where q.serie_id = new.id and q.format = 'qroc') then 'qroc'
    when new.vignette is not null then 'dp'
    else 'qcm'
  end;
  return new;
end $$;

-- Un cours qui change de titre/matière resynchronise les drapeaux de ses séries.
create or replace function public.cours_sync_series_flags() returns trigger language plpgsql as $$
begin
  if (new.titre is distinct from old.titre) or (new.matiere_id is distinct from old.matiere_id) then
    update public.qcm_series s set
      is_revisions = coalesce(new.titre like 'Révisions%', false),
      mg_series = exists (
        select 1 from public.matieres m
        where m.id = new.matiere_id
          and (m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale'))
    where s.cours_id = new.id;
  end if;
  return new;
end $$;
drop trigger if exists trg_cours_sync_series on public.cours;
create trigger trg_cours_sync_series after update on public.cours
  for each row execute function public.cours_sync_series_flags();

-- Backfill set-based (triggers désactivés le temps de la passe).
set session_replication_role = replica;
update public.qcm_series s set
  mg_series = exists (
    select 1 from public.cours c join public.matieres m on m.id = c.matiere_id
    where c.id = s.cours_id and (m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale')),
  is_revisions = exists (
    select 1 from public.cours c where c.id = s.cours_id and c.titre like 'Révisions%');
set session_replication_role = default;

-- Policy sans sous-requête corrélée.
drop policy if exists qcm_series_voie_restrict on public.qcm_series;
create policy qcm_series_voie_restrict on public.qcm_series
  as restrictive for select to public
  using (
    "current_role"() is distinct from 'student'
    or type is distinct from 'qcm'
    or not mg_series
    or case public.current_voie()
         when 'interne' then coalesce(kind, 'qcm') <> 'qroc'
         when 'externe' then (coalesce(kind, 'qcm') = 'qroc' or is_revisions)
         else true
       end
  );
