-- Items partagés : membre « QCM seulement » (06/10/2026).
--
-- Le collège Médecine intensive et réanimation est vendu en QCM seulement : sa
-- copie de Médecine d'urgence exclut toute série QROC (kind = 'qroc' ou
-- type = 'qroc'), y compris les annales QROC dont le libellé ne dit pas
-- « QROC ». Un motif de libellé (`exclure_series`) ne suffit donc pas.
--
-- `cours_partages.qcm_seulement` : pour un tel membre,
--   - une série QROC n'est pas copiée à la liaison (partage_lier) ;
--   - une série nouvelle dont le libellé contient « QROC » n'est pas répliquée ;
--   - dès qu'une question QROC entre dans une série du groupe, la jumelle de
--     cette série chez le membre « QCM seulement » est retirée (une série qui
--     contient une QROC est une série QROC : `qcm_series_set_kind`).

alter table public.cours_partages add column if not exists qcm_seulement boolean not null default false;

create or replace function public._partage_series_inserer(n public.qcm_series)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_groupe uuid; m record; v_cible uuid;
begin
  select groupe_id into v_groupe from cours_partages where cours_id = n.cours_id;
  if v_groupe is null then return; end if;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  values ('qcm_series', n.id, n.id, n.cours_id) on conflict do nothing;
  perform _partage_verrou(true);
  for m in select cp.cours_id, cp.exclure_series, cp.qcm_seulement from cours_partages cp
            where cp.groupe_id = v_groupe and cp.cours_id <> n.cours_id loop
    continue when m.exclure_series is not null and coalesce(n.label, '') ~* m.exclure_series;
    continue when m.qcm_seulement and (coalesce(n.label, '') ~* 'qroc' or n.type = 'qroc');
    v_cible := _partage_id('qcm_series', n.id, m.cours_id);
    insert into qcm_series (id, cours_id, type, label, annee, order_index, duration_minutes,
                            vignette, allowed_voies, allowed_offers)
    values (v_cible, m.cours_id, n.type, n.label, n.annee, n.order_index, n.duration_minutes,
            n.vignette, n.allowed_voies, n.allowed_offers)
    on conflict (id) do nothing;
    insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
    values ('qcm_series', v_cible, n.id, m.cours_id) on conflict do nothing;
  end loop;
  perform _partage_verrou(false);
end $$;

create or replace function public._partage_questions_inserer(n public.qcm_questions)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_parent record; s record; v_cible uuid;
begin
  select logique_id, cours_id into v_parent from contenu_partage_ids
   where tbl = 'qcm_series' and ligne_id = n.serie_id;
  if v_parent.logique_id is null then return; end if;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  values ('qcm_questions', n.id, n.id, v_parent.cours_id) on conflict do nothing;
  perform _partage_verrou(true);
  for s in select p.ligne_id, p.cours_id, coalesce(cp.qcm_seulement, false) as qcm_seulement
             from contenu_partage_ids p left join cours_partages cp on cp.cours_id = p.cours_id
            where p.tbl = 'qcm_series' and p.logique_id = v_parent.logique_id and p.ligne_id <> n.serie_id loop
    if s.qcm_seulement and n.format = 'qroc' then
      -- La série devient QROC : elle quitte le membre « QCM seulement ».
      delete from qcm_series where id = s.ligne_id;
      delete from contenu_partage_ids where tbl = 'qcm_series' and ligne_id = s.ligne_id;
      continue;
    end if;
    v_cible := _partage_id('qcm_questions', n.id, s.cours_id);
    insert into qcm_questions (id, serie_id, enonce, order_index, format, reponse_attendue,
                               correction_generale, images, commentaire_enseignant)
    values (v_cible, s.ligne_id, n.enonce, n.order_index, n.format, n.reponse_attendue,
            n.correction_generale, n.images, n.commentaire_enseignant)
    on conflict (id) do nothing;
    insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
    values ('qcm_questions', v_cible, n.id, s.cours_id) on conflict do nothing;
  end loop;
  perform _partage_verrou(false);
end $$;

-- Liaison : nouveau paramètre p_qcm_seulement (les séries QROC de la source ne
-- sont pas copiées). L'ancienne signature est remplacée.
drop function if exists public.partage_lier(uuid, uuid, text, text, text);

create or replace function public.partage_lier(
  p_source uuid, p_miroir uuid,
  p_libelle_source text, p_libelle_miroir text,
  p_exclure_series text default null,
  p_qcm_seulement boolean default false)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_groupe uuid; v_n jsonb;
begin
  if p_source = p_miroir then raise exception 'source = miroir'; end if;
  if exists (select 1 from cours_partages where cours_id = p_miroir) then
    raise exception 'le cours % est déjà membre d''un groupe', p_miroir;
  end if;
  if exists (select 1 from qcm_series where cours_id = p_miroir)
     or exists (select 1 from fiches where cours_id = p_miroir)
     or exists (select 1 from flashcards where cours_id = p_miroir) then
    raise exception 'le cours miroir % n''est pas vide', p_miroir;
  end if;

  select groupe_id into v_groupe from cours_partages where cours_id = p_source;
  if v_groupe is null then
    v_groupe := p_source;
    insert into cours_partages (cours_id, groupe_id, libelle_couverture)
    values (p_source, v_groupe, p_libelle_source);
  end if;
  insert into cours_partages (cours_id, groupe_id, libelle_couverture, exclure_series, qcm_seulement)
  values (p_miroir, v_groupe, p_libelle_miroir, p_exclure_series, p_qcm_seulement);

  perform _partage_verrou(true);

  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'qcm_series', s.id, s.id, p_source from qcm_series s where s.cours_id = p_source
  on conflict do nothing;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'qcm_questions', q.id, q.id, p_source from qcm_questions q join qcm_series s on s.id = q.serie_id
   where s.cours_id = p_source on conflict do nothing;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'qcm_items', i.id, i.id, p_source from qcm_items i join qcm_questions q on q.id = i.question_id
    join qcm_series s on s.id = q.serie_id where s.cours_id = p_source on conflict do nothing;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'fiches', f.id, f.id, p_source from fiches f where f.cours_id = p_source on conflict do nothing;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'flashcards', f.id, f.id, p_source from flashcards f where f.cours_id = p_source on conflict do nothing;

  drop table if exists _lp_series;
  create temp table _lp_series as
    select s.*, p.logique_id, _partage_id('qcm_series', p.logique_id, p_miroir) as cible
      from qcm_series s join contenu_partage_ids p on p.tbl = 'qcm_series' and p.ligne_id = s.id
     where s.cours_id = p_source
       and (p_exclure_series is null or coalesce(s.label, '') !~* p_exclure_series)
       and not (p_qcm_seulement and (s.kind = 'qroc' or s.type = 'qroc'));
  insert into qcm_series (id, cours_id, type, label, annee, order_index, duration_minutes,
                          vignette, allowed_voies, allowed_offers)
  select cible, p_miroir, type, label, annee, order_index, duration_minutes, vignette,
         allowed_voies, allowed_offers from _lp_series;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'qcm_series', cible, logique_id, p_miroir from _lp_series;

  drop table if exists _lp_questions;
  create temp table _lp_questions as
    select q.*, p.logique_id, s.cible as serie_cible,
           _partage_id('qcm_questions', p.logique_id, p_miroir) as cible
      from qcm_questions q join _lp_series s on s.id = q.serie_id
      join contenu_partage_ids p on p.tbl = 'qcm_questions' and p.ligne_id = q.id;
  insert into qcm_questions (id, serie_id, enonce, order_index, format, reponse_attendue,
                             correction_generale, images, commentaire_enseignant)
  select cible, serie_cible, enonce, order_index, format, reponse_attendue, correction_generale,
         images, commentaire_enseignant from _lp_questions;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'qcm_questions', cible, logique_id, p_miroir from _lp_questions;

  drop table if exists _lp_items;
  create temp table _lp_items as
    select i.*, p.logique_id, q.cible as question_cible,
           _partage_id('qcm_items', p.logique_id, p_miroir) as cible
      from qcm_items i join _lp_questions q on q.id = i.question_id
      join contenu_partage_ids p on p.tbl = 'qcm_items' and p.ligne_id = i.id;
  insert into qcm_items (id, question_id, lettre, enonce, is_correct, justification, images)
  select cible, question_cible, lettre, enonce, is_correct, justification, images from _lp_items;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'qcm_items', cible, logique_id, p_miroir from _lp_items;

  insert into fiches (id, cours_id, titre, storage_path, pages, extracted_text, content_json,
                      content_format, content_html, order_index)
  select _partage_id('fiches', p.logique_id, p_miroir), p_miroir, f.titre, f.storage_path, f.pages,
         f.extracted_text, f.content_json, f.content_format,
         partage_couverture(f.content_html, p_libelle_miroir), f.order_index
    from fiches f join contenu_partage_ids p on p.tbl = 'fiches' and p.ligne_id = f.id
   where f.cours_id = p_source;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'fiches', _partage_id('fiches', p.logique_id, p_miroir), p.logique_id, p_miroir
    from fiches f join contenu_partage_ids p on p.tbl = 'fiches' and p.ligne_id = f.id
   where f.cours_id = p_source;

  insert into flashcards (id, cours_id, recto, verso, order_index)
  select _partage_id('flashcards', p.logique_id, p_miroir), p_miroir, f.recto, f.verso, f.order_index
    from flashcards f join contenu_partage_ids p on p.tbl = 'flashcards' and p.ligne_id = f.id
   where f.cours_id = p_source;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  select 'flashcards', _partage_id('flashcards', p.logique_id, p_miroir), p.logique_id, p_miroir
    from flashcards f join contenu_partage_ids p on p.tbl = 'flashcards' and p.ligne_id = f.id
   where f.cours_id = p_source;

  perform _partage_verrou(false);
  drop table _lp_items; drop table _lp_questions; drop table _lp_series;

  select jsonb_build_object(
    'series', (select count(*) from qcm_series where cours_id = p_miroir),
    'questions', (select count(*) from qcm_questions q join qcm_series s on s.id = q.serie_id where s.cours_id = p_miroir),
    'items', (select count(*) from qcm_items i join qcm_questions q on q.id = i.question_id join qcm_series s on s.id = q.serie_id where s.cours_id = p_miroir),
    'fiches', (select count(*) from fiches where cours_id = p_miroir),
    'flashcards', (select count(*) from flashcards where cours_id = p_miroir)) into v_n;
  return v_n;
end $$;

revoke all on function public.partage_lier(uuid, uuid, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.partage_lier(uuid, uuid, text, text, text, boolean) to service_role;
revoke all on function public._partage_series_inserer(public.qcm_series) from public, anon, authenticated;
revoke all on function public._partage_questions_inserer(public.qcm_questions) from public, anon, authenticated;
