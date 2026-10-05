-- Items partagés entre collèges (05/10/2026).
--
-- Besoin : un même item doit pouvoir figurer dans plusieurs collèges (ex. les
-- items de pédiatrie dans le collège Médecine d'urgence) comme un item À PART
-- ENTIÈRE du collège d'accueil — aucun accès au collège d'origine, aucune
-- mention de ce collège — ET toute modification faite depuis n'importe lequel
-- des collèges doit se retrouver dans tous les autres : ce sont les mêmes items.
--
-- Pourquoi pas un simple accès au cours d'origine : `accessible_cours_ids()` et
-- `canAccessCours()` exigent le collège du cours dans `permission_scope.colleges`
-- (le collège d'origine apparaîtrait dans le navigateur, avec ses épreuves
-- blanches, son agenda…), et tout le reste de la plateforme (planificateur,
-- progression, voie, révisions) raisonne par `cours.matiere_id`.
--
-- Mécanisme : chaque membre du groupe est un vrai cours de son collège, avec
-- ses propres lignes (fiches, séries, questions, propositions, flashcards).
-- Des déclencheurs répercutent toute insertion / modification / suppression
-- faite sur un membre vers tous les autres membres du groupe, dans la même
-- transaction. `contenu_partage_ids` relie les lignes « jumelles » par un
-- identifiant logique commun.
--
--   cours_partages       : un membre par ligne (groupe_id = cours d'origine) ;
--                          `libelle_couverture` = texte de `.cover-matiere` de
--                          la fiche pour CE membre (le nom du collège d'origine
--                          n'apparaît donc pas sur la fiche d'un autre collège) ;
--                          `exclure_series` = motif (insensible à la casse) des
--                          séries du groupe NON répliquées vers ce membre.
--   contenu_partage_ids  : (table, ligne) → identifiant logique + cours membre.
--
-- Anti-boucle : pendant une répercussion, `partage.en_cours = '1'` (variable de
-- transaction) ; les déclencheurs des lignes jumelles ne répercutent rien.
--
-- PDF des fiches : un membre qui a son propre `libelle_couverture` a son propre
-- PDF. Les déclencheurs recopient le HTML (couverture adaptée) mais ne savent pas
-- rendre un PDF : la route `render-html` re-rend les fiches jumelles après chaque
-- publication (src/lib/fiches/partage.ts) et les enregistre par
-- `partage_fiche_set_pdf()`, qui n'est pas répercutée. Un PDF téléversé tel quel
-- (changement de `storage_path`) est, lui, partagé par tous les membres.
--
-- Supprimer un cours membre ne supprime RIEN chez les autres : le cours quitte
-- d'abord le groupe (déclencheur BEFORE DELETE sur `cours`).

create table if not exists public.cours_partages (
  cours_id uuid primary key references public.cours(id) on delete cascade,
  groupe_id uuid not null,
  libelle_couverture text,
  exclure_series text,
  created_at timestamptz not null default now()
);
create index if not exists cours_partages_groupe_idx on public.cours_partages (groupe_id);

create table if not exists public.contenu_partage_ids (
  tbl text not null check (tbl in ('qcm_series', 'qcm_questions', 'qcm_items', 'fiches', 'flashcards')),
  ligne_id uuid not null,
  logique_id uuid not null,
  cours_id uuid not null references public.cours(id) on delete cascade,
  primary key (tbl, ligne_id),
  unique (tbl, logique_id, cours_id)
);
create index if not exists contenu_partage_ids_logique_idx on public.contenu_partage_ids (tbl, logique_id);

-- Tables internes : aucune lecture ni écriture par PostgREST (pas de policy).
alter table public.cours_partages enable row level security;
alter table public.contenu_partage_ids enable row level security;

comment on table public.cours_partages is
  'Items partagés entre collèges : membres d''un groupe dont le contenu est synchronisé par déclencheurs (migration 20261005220000).';
comment on table public.contenu_partage_ids is
  'Lignes jumelles des items partagés : (table, ligne) → identifiant logique commun.';

-- ── Outils ─────────────────────────────────────────────────────────────────

create or replace function public.partage_libre()
returns boolean language sql stable as $$
  select coalesce(current_setting('partage.en_cours', true), '') <> '1'
$$;

create or replace function public._partage_verrou(actif boolean)
returns void language sql as $$
  select set_config('partage.en_cours', case when actif then '1' else '0' end, true)
$$;

-- Identifiant de la ligne jumelle d'un membre : celui déjà connu, sinon un
-- identifiant déterministe (rejouable).
create or replace function public._partage_id(p_tbl text, p_logique uuid, p_cours uuid)
returns uuid language sql stable as $$
  select coalesce(
    (select ligne_id from public.contenu_partage_ids
      where tbl = p_tbl and logique_id = p_logique and cours_id = p_cours),
    md5('partage:' || p_tbl || ':' || p_logique::text || ':' || p_cours::text)::uuid)
$$;

create or replace function public.partage_couverture(p_html text, p_libelle text)
returns text language sql immutable as $$
  select case
    when p_html is null or p_libelle is null then p_html
    else regexp_replace(p_html, '(class="cover-matiere"[^>]*>)[^<]*(<)',
                        '\1' || replace(p_libelle, '\', '\\') || '\2')
  end
$$;

-- ── Séries ─────────────────────────────────────────────────────────────────

create or replace function public._partage_series_supprimer(p_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  select logique_id into v_logique from contenu_partage_ids where tbl = 'qcm_series' and ligne_id = p_id;
  if v_logique is null then return; end if;
  delete from contenu_partage_ids where tbl = 'qcm_series' and ligne_id = p_id;
  if not partage_libre() then return; end if;
  perform _partage_verrou(true);
  delete from qcm_series s using contenu_partage_ids p
   where p.tbl = 'qcm_series' and p.logique_id = v_logique and s.id = p.ligne_id;
  delete from contenu_partage_ids where tbl = 'qcm_series' and logique_id = v_logique;
  perform _partage_verrou(false);
end $$;

create or replace function public._partage_series_inserer(n public.qcm_series)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_groupe uuid; m record; v_cible uuid;
begin
  select groupe_id into v_groupe from cours_partages where cours_id = n.cours_id;
  if v_groupe is null then return; end if;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  values ('qcm_series', n.id, n.id, n.cours_id) on conflict do nothing;
  perform _partage_verrou(true);
  for m in select cp.cours_id, cp.exclure_series from cours_partages cp
            where cp.groupe_id = v_groupe and cp.cours_id <> n.cours_id loop
    continue when m.exclure_series is not null and coalesce(n.label, '') ~* m.exclure_series;
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

create or replace function public.partage_qcm_series()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  if tg_op = 'DELETE' then
    perform _partage_series_supprimer(old.id);
    return null;
  end if;
  if not partage_libre() then return null; end if;
  if tg_op = 'INSERT' then
    perform _partage_series_inserer(new);
    return null;
  end if;
  -- UPDATE
  if new.cours_id is distinct from old.cours_id then
    perform _partage_series_supprimer(old.id);
    perform _partage_series_inserer(new);
    return null;
  end if;
  if (new.type, new.label, new.annee, new.order_index, new.duration_minutes, new.vignette,
      new.allowed_voies, new.allowed_offers)
     is not distinct from
     (old.type, old.label, old.annee, old.order_index, old.duration_minutes, old.vignette,
      old.allowed_voies, old.allowed_offers) then
    return null;
  end if;
  select logique_id into v_logique from contenu_partage_ids where tbl = 'qcm_series' and ligne_id = new.id;
  if v_logique is null then return null; end if;
  perform _partage_verrou(true);
  update qcm_series s
     set type = new.type, label = new.label, annee = new.annee, order_index = new.order_index,
         duration_minutes = new.duration_minutes, vignette = new.vignette,
         allowed_voies = new.allowed_voies, allowed_offers = new.allowed_offers
    from contenu_partage_ids p
   where p.tbl = 'qcm_series' and p.logique_id = v_logique and p.ligne_id <> new.id
     and s.id = p.ligne_id;
  perform _partage_verrou(false);
  return null;
end $$;

-- ── Questions ──────────────────────────────────────────────────────────────

create or replace function public._partage_questions_supprimer(p_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  select logique_id into v_logique from contenu_partage_ids where tbl = 'qcm_questions' and ligne_id = p_id;
  if v_logique is null then return; end if;
  delete from contenu_partage_ids where tbl = 'qcm_questions' and ligne_id = p_id;
  if not partage_libre() then return; end if;
  perform _partage_verrou(true);
  delete from qcm_questions q using contenu_partage_ids p
   where p.tbl = 'qcm_questions' and p.logique_id = v_logique and q.id = p.ligne_id;
  delete from contenu_partage_ids where tbl = 'qcm_questions' and logique_id = v_logique;
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
  for s in select ligne_id, cours_id from contenu_partage_ids
            where tbl = 'qcm_series' and logique_id = v_parent.logique_id and ligne_id <> n.serie_id loop
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

create or replace function public.partage_qcm_questions()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  if tg_op = 'DELETE' then
    perform _partage_questions_supprimer(old.id);
    return null;
  end if;
  if not partage_libre() then return null; end if;
  if tg_op = 'INSERT' then
    perform _partage_questions_inserer(new);
    return null;
  end if;
  if new.serie_id is distinct from old.serie_id then
    perform _partage_questions_supprimer(old.id);
    perform _partage_questions_inserer(new);
    return null;
  end if;
  if (new.enonce, new.order_index, new.format, new.reponse_attendue, new.correction_generale,
      new.images, new.commentaire_enseignant)
     is not distinct from
     (old.enonce, old.order_index, old.format, old.reponse_attendue, old.correction_generale,
      old.images, old.commentaire_enseignant) then
    return null;
  end if;
  select logique_id into v_logique from contenu_partage_ids where tbl = 'qcm_questions' and ligne_id = new.id;
  if v_logique is null then return null; end if;
  perform _partage_verrou(true);
  update qcm_questions q
     set enonce = new.enonce, order_index = new.order_index, format = new.format,
         reponse_attendue = new.reponse_attendue, correction_generale = new.correction_generale,
         images = new.images, commentaire_enseignant = new.commentaire_enseignant
    from contenu_partage_ids p
   where p.tbl = 'qcm_questions' and p.logique_id = v_logique and p.ligne_id <> new.id
     and q.id = p.ligne_id;
  perform _partage_verrou(false);
  return null;
end $$;

-- ── Propositions ───────────────────────────────────────────────────────────

create or replace function public._partage_items_supprimer(p_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  select logique_id into v_logique from contenu_partage_ids where tbl = 'qcm_items' and ligne_id = p_id;
  if v_logique is null then return; end if;
  delete from contenu_partage_ids where tbl = 'qcm_items' and ligne_id = p_id;
  if not partage_libre() then return; end if;
  perform _partage_verrou(true);
  delete from qcm_items i using contenu_partage_ids p
   where p.tbl = 'qcm_items' and p.logique_id = v_logique and i.id = p.ligne_id;
  delete from contenu_partage_ids where tbl = 'qcm_items' and logique_id = v_logique;
  perform _partage_verrou(false);
end $$;

create or replace function public._partage_items_inserer(n public.qcm_items)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_parent record; q record; v_cible uuid;
begin
  select logique_id, cours_id into v_parent from contenu_partage_ids
   where tbl = 'qcm_questions' and ligne_id = n.question_id;
  if v_parent.logique_id is null then return; end if;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  values ('qcm_items', n.id, n.id, v_parent.cours_id) on conflict do nothing;
  perform _partage_verrou(true);
  for q in select ligne_id, cours_id from contenu_partage_ids
            where tbl = 'qcm_questions' and logique_id = v_parent.logique_id and ligne_id <> n.question_id loop
    v_cible := _partage_id('qcm_items', n.id, q.cours_id);
    insert into qcm_items (id, question_id, lettre, enonce, is_correct, justification, images)
    values (v_cible, q.ligne_id, n.lettre, n.enonce, n.is_correct, n.justification, n.images)
    on conflict (id) do nothing;
    insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
    values ('qcm_items', v_cible, n.id, q.cours_id) on conflict do nothing;
  end loop;
  perform _partage_verrou(false);
end $$;

create or replace function public.partage_qcm_items()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  if tg_op = 'DELETE' then
    perform _partage_items_supprimer(old.id);
    return null;
  end if;
  if not partage_libre() then return null; end if;
  if tg_op = 'INSERT' then
    perform _partage_items_inserer(new);
    return null;
  end if;
  if new.question_id is distinct from old.question_id then
    perform _partage_items_supprimer(old.id);
    perform _partage_items_inserer(new);
    return null;
  end if;
  if (new.lettre, new.enonce, new.is_correct, new.justification, new.images)
     is not distinct from
     (old.lettre, old.enonce, old.is_correct, old.justification, old.images) then
    return null;
  end if;
  select logique_id into v_logique from contenu_partage_ids where tbl = 'qcm_items' and ligne_id = new.id;
  if v_logique is null then return null; end if;
  perform _partage_verrou(true);
  update qcm_items i
     -- La lettre ne suit que si elle a changé : deux jumelles aux lettres
     -- différentes ne doivent pas heurter l'unicité (question_id, lettre).
     set lettre = case when new.lettre is distinct from old.lettre then new.lettre else i.lettre end,
         enonce = new.enonce, is_correct = new.is_correct,
         justification = new.justification, images = new.images
    from contenu_partage_ids p
   where p.tbl = 'qcm_items' and p.logique_id = v_logique and p.ligne_id <> new.id
     and i.id = p.ligne_id;
  perform _partage_verrou(false);
  return null;
end $$;

-- ── Flashcards ─────────────────────────────────────────────────────────────

create or replace function public._partage_flashcards_supprimer(p_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  select logique_id into v_logique from contenu_partage_ids where tbl = 'flashcards' and ligne_id = p_id;
  if v_logique is null then return; end if;
  delete from contenu_partage_ids where tbl = 'flashcards' and ligne_id = p_id;
  if not partage_libre() then return; end if;
  perform _partage_verrou(true);
  delete from flashcards f using contenu_partage_ids p
   where p.tbl = 'flashcards' and p.logique_id = v_logique and f.id = p.ligne_id;
  delete from contenu_partage_ids where tbl = 'flashcards' and logique_id = v_logique;
  perform _partage_verrou(false);
end $$;

create or replace function public._partage_flashcards_inserer(n public.flashcards)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_groupe uuid; m record; v_cible uuid;
begin
  select groupe_id into v_groupe from cours_partages where cours_id = n.cours_id;
  if v_groupe is null then return; end if;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  values ('flashcards', n.id, n.id, n.cours_id) on conflict do nothing;
  perform _partage_verrou(true);
  for m in select cp.cours_id from cours_partages cp
            where cp.groupe_id = v_groupe and cp.cours_id <> n.cours_id loop
    v_cible := _partage_id('flashcards', n.id, m.cours_id);
    insert into flashcards (id, cours_id, recto, verso, order_index)
    values (v_cible, m.cours_id, n.recto, n.verso, n.order_index)
    on conflict (id) do nothing;
    insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
    values ('flashcards', v_cible, n.id, m.cours_id) on conflict do nothing;
  end loop;
  perform _partage_verrou(false);
end $$;

create or replace function public.partage_flashcards()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  if tg_op = 'DELETE' then
    perform _partage_flashcards_supprimer(old.id);
    return null;
  end if;
  if not partage_libre() then return null; end if;
  if tg_op = 'INSERT' then
    perform _partage_flashcards_inserer(new);
    return null;
  end if;
  if new.cours_id is distinct from old.cours_id then
    perform _partage_flashcards_supprimer(old.id);
    perform _partage_flashcards_inserer(new);
    return null;
  end if;
  if (new.recto, new.verso, new.order_index) is not distinct from (old.recto, old.verso, old.order_index) then
    return null;
  end if;
  select logique_id into v_logique from contenu_partage_ids where tbl = 'flashcards' and ligne_id = new.id;
  if v_logique is null then return null; end if;
  perform _partage_verrou(true);
  update flashcards f
     set recto = new.recto, verso = new.verso, order_index = new.order_index
    from contenu_partage_ids p
   where p.tbl = 'flashcards' and p.logique_id = v_logique and p.ligne_id <> new.id
     and f.id = p.ligne_id;
  perform _partage_verrou(false);
  return null;
end $$;

-- ── Fiches ─────────────────────────────────────────────────────────────────

create or replace function public._partage_fiches_supprimer(p_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid;
begin
  select logique_id into v_logique from contenu_partage_ids where tbl = 'fiches' and ligne_id = p_id;
  if v_logique is null then return; end if;
  delete from contenu_partage_ids where tbl = 'fiches' and ligne_id = p_id;
  if not partage_libre() then return; end if;
  perform _partage_verrou(true);
  delete from fiches f using contenu_partage_ids p
   where p.tbl = 'fiches' and p.logique_id = v_logique and f.id = p.ligne_id;
  delete from contenu_partage_ids where tbl = 'fiches' and logique_id = v_logique;
  perform _partage_verrou(false);
end $$;

create or replace function public._partage_fiches_inserer(n public.fiches)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_groupe uuid; m record; v_cible uuid;
begin
  select groupe_id into v_groupe from cours_partages where cours_id = n.cours_id;
  if v_groupe is null then return; end if;
  insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
  values ('fiches', n.id, n.id, n.cours_id) on conflict do nothing;
  perform _partage_verrou(true);
  for m in select cp.cours_id, cp.libelle_couverture from cours_partages cp
            where cp.groupe_id = v_groupe and cp.cours_id <> n.cours_id loop
    v_cible := _partage_id('fiches', n.id, m.cours_id);
    -- Le PDF est d'abord partagé ; la route de publication re-rend ensuite celui
    -- du membre (couverture propre) via partage_fiche_set_pdf().
    insert into fiches (id, cours_id, titre, storage_path, pages, extracted_text, content_json,
                        content_format, content_html, order_index)
    values (v_cible, m.cours_id, n.titre, n.storage_path, n.pages, n.extracted_text, n.content_json,
            n.content_format, partage_couverture(n.content_html, m.libelle_couverture), n.order_index)
    on conflict (id) do nothing;
    insert into contenu_partage_ids (tbl, ligne_id, logique_id, cours_id)
    values ('fiches', v_cible, n.id, m.cours_id) on conflict do nothing;
  end loop;
  perform _partage_verrou(false);
end $$;

create or replace function public.partage_fiches()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_logique uuid; m record;
begin
  if tg_op = 'DELETE' then
    perform _partage_fiches_supprimer(old.id);
    return null;
  end if;
  if not partage_libre() then return null; end if;
  if tg_op = 'INSERT' then
    perform _partage_fiches_inserer(new);
    return null;
  end if;
  if new.cours_id is distinct from old.cours_id then
    perform _partage_fiches_supprimer(old.id);
    perform _partage_fiches_inserer(new);
    return null;
  end if;
  if (new.titre, new.storage_path, new.pages, new.extracted_text, new.content_json,
      new.content_format, new.content_html, new.order_index)
     is not distinct from
     (old.titre, old.storage_path, old.pages, old.extracted_text, old.content_json,
      old.content_format, old.content_html, old.order_index) then
    return null;
  end if;
  select logique_id into v_logique from contenu_partage_ids where tbl = 'fiches' and ligne_id = new.id;
  if v_logique is null then return null; end if;
  perform _partage_verrou(true);
  for m in select p.ligne_id, cp.libelle_couverture
             from contenu_partage_ids p join cours_partages cp on cp.cours_id = p.cours_id
            where p.tbl = 'fiches' and p.logique_id = v_logique and p.ligne_id <> new.id loop
    update fiches f
       set titre = new.titre,
           extracted_text = new.extracted_text,
           content_json = new.content_json,
           content_format = new.content_format,
           content_html = case when new.content_html is distinct from old.content_html
                               then partage_couverture(new.content_html, m.libelle_couverture)
                               else f.content_html end,
           order_index = new.order_index,
           -- Nouveau fichier téléversé : partagé par tous. Sinon chacun garde le sien.
           storage_path = case when new.storage_path is distinct from old.storage_path
                               then new.storage_path else f.storage_path end,
           pages = case when new.storage_path is distinct from old.storage_path
                        then new.pages else f.pages end
     where f.id = m.ligne_id;
  end loop;
  perform _partage_verrou(false);
  return null;
end $$;

-- Enregistre le PDF re-rendu d'une fiche jumelle, sans répercussion.
create or replace function public.partage_fiche_set_pdf(p_fiche_id uuid, p_storage_path text, p_pages integer)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform _partage_verrou(true);
  update fiches set storage_path = p_storage_path, pages = p_pages where id = p_fiche_id;
  perform _partage_verrou(false);
end $$;

-- Fiches jumelles d'une fiche (pour le re-rendu de leur PDF).
create or replace function public.partage_fiches_jumelles(p_fiche_id uuid)
returns table (fiche_id uuid, cours_id uuid, cours_titre text, storage_path text, content_html text)
language sql stable security definer set search_path = public, pg_temp as $$
  select f.id, f.cours_id, c.titre, f.storage_path, f.content_html
    from contenu_partage_ids moi
    join contenu_partage_ids p on p.tbl = 'fiches' and p.logique_id = moi.logique_id and p.ligne_id <> moi.ligne_id
    join fiches f on f.id = p.ligne_id
    join cours c on c.id = f.cours_id
   where moi.tbl = 'fiches' and moi.ligne_id = p_fiche_id
$$;

-- Un cours supprimé quitte son groupe AVANT la cascade : ses lignes ne sont
-- plus jumelées, leur suppression ne touche pas les autres membres.
create or replace function public.partage_cours_quitter()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  delete from contenu_partage_ids where cours_id = old.id;
  delete from cours_partages where cours_id = old.id;
  return old;
end $$;

-- ── Liaison initiale d'un cours miroir (vide) à un cours source ────────────
-- Copie tout le contenu de la source dans le miroir et jumelle chaque ligne.
create or replace function public.partage_lier(
  p_source uuid, p_miroir uuid,
  p_libelle_source text, p_libelle_miroir text,
  p_exclure_series text default null)
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
  insert into cours_partages (cours_id, groupe_id, libelle_couverture, exclure_series)
  values (p_miroir, v_groupe, p_libelle_miroir, p_exclure_series);

  perform _partage_verrou(true);

  -- Lignes de la source : jumelées à elles-mêmes si elles ne le sont pas déjà.
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

  -- Copies dans le miroir.
  drop table if exists _lp_series;
  create temp table _lp_series as
    select s.*, p.logique_id, _partage_id('qcm_series', p.logique_id, p_miroir) as cible
      from qcm_series s join contenu_partage_ids p on p.tbl = 'qcm_series' and p.ligne_id = s.id
     where s.cours_id = p_source
       and (p_exclure_series is null or coalesce(s.label, '') !~* p_exclure_series);
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

revoke all on function public.partage_lier(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.partage_fiche_set_pdf(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.partage_fiches_jumelles(uuid) from public, anon, authenticated;
grant execute on function public.partage_lier(uuid, uuid, text, text, text) to service_role;
grant execute on function public.partage_fiche_set_pdf(uuid, text, integer) to service_role;
grant execute on function public.partage_fiches_jumelles(uuid) to service_role;
revoke all on function public._partage_series_supprimer(uuid) from public, anon, authenticated;
revoke all on function public._partage_series_inserer(public.qcm_series) from public, anon, authenticated;
revoke all on function public._partage_questions_supprimer(uuid) from public, anon, authenticated;
revoke all on function public._partage_questions_inserer(public.qcm_questions) from public, anon, authenticated;
revoke all on function public._partage_items_supprimer(uuid) from public, anon, authenticated;
revoke all on function public._partage_items_inserer(public.qcm_items) from public, anon, authenticated;
revoke all on function public._partage_flashcards_supprimer(uuid) from public, anon, authenticated;
revoke all on function public._partage_flashcards_inserer(public.flashcards) from public, anon, authenticated;
revoke all on function public._partage_fiches_supprimer(uuid) from public, anon, authenticated;
revoke all on function public._partage_fiches_inserer(public.fiches) from public, anon, authenticated;

-- ── Déclencheurs ───────────────────────────────────────────────────────────

drop trigger if exists zz_partage on public.qcm_series;
create trigger zz_partage after insert or update or delete on public.qcm_series
  for each row execute function public.partage_qcm_series();
drop trigger if exists zz_partage on public.qcm_questions;
create trigger zz_partage after insert or update or delete on public.qcm_questions
  for each row execute function public.partage_qcm_questions();
drop trigger if exists zz_partage on public.qcm_items;
create trigger zz_partage after insert or update or delete on public.qcm_items
  for each row execute function public.partage_qcm_items();
drop trigger if exists zz_partage on public.flashcards;
create trigger zz_partage after insert or update or delete on public.flashcards
  for each row execute function public.partage_flashcards();
drop trigger if exists zz_partage on public.fiches;
create trigger zz_partage after insert or update or delete on public.fiches
  for each row execute function public.partage_fiches();
drop trigger if exists aa_partage_quitter on public.cours;
create trigger aa_partage_quitter before delete on public.cours
  for each row execute function public.partage_cours_quitter();
