-- Classe chaque série QCM (type='qcm') en 'qcm' | 'dp' | 'qroc' et applique la
-- restriction d'accès par voie de concours (Médecine générale) via RLS :
--   - voie interne : pas d'accès aux séries QROC.
--   - voie externe : pas d'accès aux séries QCM/DP, sauf sur l'item « Révisions ».

alter table public.qcm_series add column if not exists kind text;

update public.qcm_series s set kind = case
  when exists (select 1 from public.qcm_questions q where q.serie_id = s.id and q.format = 'qroc') then 'qroc'
  when s.vignette is not null then 'dp'
  else 'qcm'
end
where s.type = 'qcm';

create or replace function public.qcm_series_set_kind() returns trigger language plpgsql as $$
begin
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

drop trigger if exists trg_qcm_series_kind on public.qcm_series;
create trigger trg_qcm_series_kind before insert or update on public.qcm_series
  for each row execute function public.qcm_series_set_kind();

create or replace function public.qcm_questions_touch_serie() returns trigger language plpgsql as $$
declare sid uuid;
begin
  sid := coalesce(new.serie_id, old.serie_id);
  update public.qcm_series set label = label where id = sid; -- re-fire BEFORE trigger → recompute kind
  return null;
end $$;

drop trigger if exists trg_qcm_questions_kind on public.qcm_questions;
create trigger trg_qcm_questions_kind after insert or update or delete on public.qcm_questions
  for each row execute function public.qcm_questions_touch_serie();

-- RLS restrictive : n'affecte que les étudiants (admin/prof exemptés).
drop policy if exists qcm_series_voie_restrict on public.qcm_series;
create policy qcm_series_voie_restrict on public.qcm_series
  as restrictive for select to public
  using (
    "current_role"() is distinct from 'student'
    or type is distinct from 'qcm'
    or not exists (
      select 1 from public.cours c
      join public.matieres m on m.id = c.matiere_id
      where c.id = qcm_series.cours_id
        and (m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale')
    )
    or (
      case
        when (select p.permission_scope->>'paid_voie' from public.profiles p where p.id = auth.uid()) = 'interne'
          then coalesce(qcm_series.kind, 'qcm') <> 'qroc'
        when (select p.permission_scope->>'paid_voie' from public.profiles p where p.id = auth.uid()) = 'externe'
          then (
            coalesce(qcm_series.kind, 'qcm') = 'qroc'
            or (select c.titre from public.cours c where c.id = qcm_series.cours_id) = 'Révisions'
          )
        else true
      end
    )
  );
