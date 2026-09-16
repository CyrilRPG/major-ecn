-- =====================================================================
-- Items « Révisions - <Collège> » renommés « Replays - Révisions » (16/09/2026)
-- ---------------------------------------------------------------------
-- Même libellé dans tous les collèges, sans nom de collège derrière
-- (décision de Cyril). Le drapeau `qcm_series.is_revisions` (exemption de la
-- voie externe) était calculé sur `titre like 'Révisions%'` : les deux
-- fonctions de trigger reconnaissent désormais aussi le nouveau libellé,
-- AVANT le renommage, pour que le trigger de resynchronisation ne remette
-- aucune série à faux. Sans risque à relancer.
-- =====================================================================

create or replace function public.qcm_series_set_kind() returns trigger language plpgsql as $$
begin
  select coalesce(m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale', false),
         coalesce(c.titre like 'Révisions%' or c.titre like 'Replays - Révisions%', false)
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

create or replace function public.cours_sync_series_flags() returns trigger language plpgsql as $$
begin
  if (new.titre is distinct from old.titre) or (new.matiere_id is distinct from old.matiere_id) then
    update public.qcm_series s set
      is_revisions = coalesce(new.titre like 'Révisions%' or new.titre like 'Replays - Révisions%', false),
      mg_series = exists (
        select 1 from public.matieres m
        where m.id = new.matiere_id
          and (m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale'))
    where s.cours_id = new.id;
  end if;
  return new;
end $$;

-- Renommage : tous les « Révisions - … » (tiret simple ou demi-cadratin).
update public.cours
   set titre = 'Replays - Révisions'
 where titre ~* '^r[eé]visions?\s*[-–—]\s*\S';

-- Contrôle : aucune série ne doit avoir perdu son drapeau.
update public.qcm_series s set is_revisions = true
 where is_revisions = false
   and exists (select 1 from public.cours c where c.id = s.cours_id and c.titre like 'Replays - Révisions%');
