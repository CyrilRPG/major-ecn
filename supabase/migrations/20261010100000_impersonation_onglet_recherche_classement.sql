-- ════════════════════════════════════════════════════════════════════════
-- 10/10/2026 — Trois chantiers + un correctif de sécurité :
--
--  1. « Se connecter en tant que » dans un NOUVEL ONGLET (fiche candidat) :
--     tickets à usage unique, valables 60 secondes, stockés HACHÉS. Le
--     ticket ouvre la session élève sur un AUTRE domaine (cookies distincts),
--     la session admin de l'onglet d'origine n'est jamais touchée.
--  2. Recherche par mots-clés dans le texte des fiches de cours (palette ⌘K) :
--     index plein texte `fiches_recherche`, tenu à jour par trigger.
--  3. CRM pédagogique, onglet « Classement » : agrégats d'activité par élève,
--     sur toute la période ou depuis une date.
--  4. SÉCURITÉ : plusieurs fonctions SECURITY DEFINER réservées au
--     back-office étaient exécutables par `anon` et `authenticated` (droit
--     EXECUTE par défaut de PUBLIC) — n'importe qui, avec la clé publique,
--     lisait l'activité de tous les élèves via admin_crm_activity(text).
--     Toutes sont appelées par le client service-role : on retire le droit.
-- ════════════════════════════════════════════════════════════════════════

-- ─── 4. Fonctions back-office : service-role uniquement ────────────────────
-- Rejouable sur une base neuve : certaines de ces fonctions n'ont été créées
-- qu'en production (hors migrations versionnées) ; on ne touche qu'à celles
-- qui existent.
do $$
declare
  f text;
begin
  foreach f in array array[
    'public.admin_crm_activity(text)',
    'public.admin_activity_snapshot(text)',
    'public.admin_facturation_lines()',
    'public.admin_facturation_lines(text)',
    -- Publie un import d'exercices (écrit des séries) : action admin, via service-role.
    'public.publish_exercise_import(uuid)',
    -- Appelée par le cron (service-role) et par des triggers SECURITY DEFINER.
    'public.recompute_user_revision_stats(uuid)'
  ] loop
    if to_regprocedure(f) is not null then
      execute format('revoke all on function %s from public, anon, authenticated', f);
      execute format('grant execute on function %s to service_role', f);
    end if;
  end loop;
end;
$$;

-- ─── 1. Tickets « se connecter en tant que » (nouvel onglet) ──────────────
create table if not exists public.impersonation_tickets (
  id              uuid primary key default gen_random_uuid(),
  -- SHA-256 hexadécimal du jeton : le jeton en clair n'est jamais stocké.
  token_hash      text not null unique,
  admin_id        uuid not null references auth.users(id) on delete cascade,
  target_id       uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null,
  used_at         timestamptz,
  used_ip         text,
  used_user_agent text
);
create index if not exists impersonation_tickets_admin_idx on public.impersonation_tickets (admin_id, created_at desc);
create index if not exists impersonation_tickets_target_idx on public.impersonation_tickets (target_id, created_at desc);
-- RLS sans aucune policy : seul le service-role lit et écrit (journal compris).
alter table public.impersonation_tickets enable row level security;
revoke all on table public.impersonation_tickets from anon, authenticated;

-- ─── 2. Recherche plein texte dans les fiches ─────────────────────────────
-- Minuscules + accents retirés, caractère pour caractère (les positions dans
-- le texte plié correspondent à celles du texte d'origine → extraits).
create or replace function public.recherche_plier(p text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select translate(lower(coalesce(p, '')),
    'àâäáãåāçćčéèêëēėęíìîïīñńóòôöõøōúùûüūýÿž',
    'aaaaaaaccceeeeeeeiiiiinnooooooouuuuuyyz');
$$;

-- Entités HTML → caractères : entités numériques (&#9679;) et nommées usuelles
-- (&middot;, &eacute;, &ge;…) ; une entité inconnue devient une espace.
create or replace function public.html_entites_decoder(p text)
returns text
language plpgsql
immutable
parallel safe
set search_path = ''
as $$
declare
  noms constant jsonb := '{"nbsp":" ","amp":"&","lt":"<","gt":">","quot":"\"","apos":"''","middot":"·","hellip":"…",
    "ndash":"–","mdash":"—","laquo":"«","raquo":"»","lsquo":"‘","rsquo":"’","ldquo":"“","rdquo":"”","bull":"•",
    "rarr":"→","larr":"←","uarr":"↑","darr":"↓","harr":"↔","rArr":"⇒","hArr":"⇔","ge":"≥","le":"≤","ne":"≠",
    "asymp":"≈","plusmn":"±","minus":"−","times":"×","divide":"÷","deg":"°","micro":"µ","mu":"μ","alpha":"α",
    "beta":"β","gamma":"γ","delta":"δ","Delta":"Δ","kappa":"κ","lambda":"λ","sigma":"σ","omega":"ω","reg":"®",
    "trade":"™","copy":"©","dagger":"†","sup2":"²","sup3":"³","frac12":"½","frac14":"¼","frac34":"¾","shy":"",
    "eacute":"é","egrave":"è","ecirc":"ê","euml":"ë","Eacute":"É","Egrave":"È","Ecirc":"Ê","agrave":"à",
    "acirc":"â","Agrave":"À","ccedil":"ç","Ccedil":"Ç","icirc":"î","iuml":"ï","ocirc":"ô","ouml":"ö","oelig":"œ",
    "OElig":"Œ","aelig":"æ","ucirc":"û","ugrave":"ù","uuml":"ü","yuml":"ÿ"}';
  r text := p;
  m text[];
  n integer;
begin
  if r is null or strpos(r, '&') = 0 then return r; end if;
  for m in select distinct x from regexp_matches(r, '&(#?[A-Za-z0-9]{1,10});', 'g') as x loop
    n := null;
    if m[1] ~ '^#[0-9]{1,7}$' then
      n := substr(m[1], 2)::integer;
      if n < 32 or n > 1114111 or n between 55296 and 57343 then n := null; end if;
    end if;
    r := replace(r, '&' || m[1] || ';',
      case when n is not null then chr(n) else coalesce(noms ->> m[1], ' ') end);
  end loop;
  return r;
end;
$$;

-- Texte brut d'une fiche HTML : images (souvent en base64, des Mo par fiche),
-- styles et balises retirés, entités décodées, espaces compactés.
create or replace function public.texte_brut_html(p_html text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select btrim(regexp_replace(
    public.html_entites_decoder(
      regexp_replace(
        regexp_replace(
          regexp_replace(coalesce(p_html, ''), '<img[^>]*>', ' ', 'gi'),
          '<style[^>]*>[^<]*</style>', ' ', 'gi'),
        '<[^>]*>', ' ', 'g')),
    '\s+', ' ', 'g'));
$$;

create table if not exists public.fiches_recherche (
  fiche_id   uuid primary key references public.fiches(id) on delete cascade,
  cours_id   uuid not null,
  texte      text not null default '',
  tsv        tsvector not null,
  updated_at timestamptz not null default now()
);
create index if not exists fiches_recherche_tsv_idx on public.fiches_recherche using gin (tsv);
create index if not exists fiches_recherche_cours_idx on public.fiches_recherche (cours_id);
-- Contenu payant : jamais lisible directement. La route de recherche passe par
-- le service-role APRÈS avoir calculé les items accessibles à l'élève.
alter table public.fiches_recherche enable row level security;
revoke all on table public.fiches_recherche from anon, authenticated;

-- Indexe UNE fiche. Ne lève jamais : une fiche doit toujours pouvoir être
-- enregistrée, même si son indexation échoue (texte hors normes…).
create or replace function public.fiches_recherche_indexer(p_fiche_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cours uuid;
  v_titre text;
  v_texte text;
  v_pdf text;
begin
  select f.cours_id, coalesce(f.titre, ''),
         coalesce(nullif(btrim(f.extracted_text), ''), public.texte_brut_html(f.content_html)),
         f.storage_path
    into v_cours, v_titre, v_texte, v_pdf
    from public.fiches f where f.id = p_fiche_id;
  -- Fiche non publiée (aucun PDF : « en cours de rédaction », masquée par la
  -- page Fiche) : hors index, jamais d'extrait de brouillon.
  if not found or v_pdf is null then
    delete from public.fiches_recherche where fiche_id = p_fiche_id;
    return;
  end if;
  -- tsvector plafonné à 1 Mo : on borne le texte indexé.
  v_texte := left(coalesce(v_texte, ''), 400000);
  insert into public.fiches_recherche (fiche_id, cours_id, texte, tsv, updated_at)
  values (
    p_fiche_id, v_cours, v_texte,
    setweight(to_tsvector('french', public.recherche_plier(v_titre)), 'A')
      || setweight(to_tsvector('french', public.recherche_plier(v_texte)), 'B'),
    now()
  )
  on conflict (fiche_id) do update
    set cours_id = excluded.cours_id, texte = excluded.texte, tsv = excluded.tsv, updated_at = now();
exception when others then
  raise warning 'fiches_recherche_indexer(%) : %', p_fiche_id, sqlerrm;
end;
$$;
revoke all on function public.fiches_recherche_indexer(uuid) from public, anon, authenticated;
grant execute on function public.fiches_recherche_indexer(uuid) to service_role;

create or replace function public.fiches_recherche_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.fiches_recherche_indexer(new.id);
  return null;
end;
$$;
revoke all on function public.fiches_recherche_sync() from public, anon, authenticated;

drop trigger if exists fiches_recherche_sync on public.fiches;
create trigger fiches_recherche_sync
  after insert or update of content_html, extracted_text, titre, cours_id, storage_path on public.fiches
  for each row execute function public.fiches_recherche_sync();

-- Recherche : mots de la requête pliés, réduits à [a-z0-9] (aucune syntaxe
-- tsquery ne peut être injectée), en préfixe (« cardiaq » trouve
-- « cardiaque »), tous requis. Bornée aux items fournis par l'appelant.
create or replace function public.rechercher_fiches(p_q text, p_cours_ids uuid[], p_limite integer default 20)
returns table (fiche_id uuid, cours_id uuid, extrait text, rang real)
language plpgsql
stable
set search_path = public
as $$
declare
  v_mots text[];
  v_tsq tsquery;
  v_ancre text;
begin
  select array_agg(m) into v_mots
    from (
      select m from regexp_split_to_table(public.recherche_plier(left(coalesce(p_q, ''), 200)), '[^a-z0-9]+') as m
      where length(m) >= 2
      limit 8
    ) s;
  if v_mots is null or p_cours_ids is null or cardinality(p_cours_ids) = 0 then return; end if;
  -- Préfixe à partir de 3 caractères ; un mot de 2 lettres (« IC », « PR »)
  -- est cherché tel quel (un préfixe de 2 lettres balaierait tout l'index).
  v_tsq := to_tsquery('french', array_to_string(array(
    select case when length(m) >= 3 then m || ':*' else m end from unnest(v_mots) as m), ' & '));
  if numnode(v_tsq) = 0 then return; end if;
  -- Ancre de l'extrait : le mot le plus long, privé de sa terminaison
  -- (« cardiaques » retrouve « cardiaque »).
  select left(m, greatest(length(m) - 2, 3)) into v_ancre
    from unnest(v_mots) as m order by length(m) desc limit 1;

  return query
  with top as (
    select fr.fiche_id, fr.cours_id, fr.texte, ts_rank(fr.tsv, v_tsq) as rang
      from public.fiches_recherche fr
     where fr.cours_id = any(p_cours_ids)
       and fr.tsv @@ v_tsq
     order by 4 desc
     limit least(greatest(coalesce(p_limite, 20), 1), 50)
  )
  select t.fiche_id, t.cours_id,
         case when p.pos > 0 then substr(t.texte, greatest(p.pos - 90, 1), 240) else left(t.texte, 200) end,
         t.rang
    from top t
    cross join lateral (select strpos(public.recherche_plier(t.texte), v_ancre) as pos) p
   order by t.rang desc;
end;
$$;
revoke all on function public.rechercher_fiches(text, uuid[], integer) from public, anon, authenticated;
grant execute on function public.rechercher_fiches(text, uuid[], integer) to service_role;

-- Le remplissage initial (≈ 1 700 fiches, 1,4 Go de HTML) se fait par lots :
--   select public.fiches_recherche_indexer(id) from public.fiches
--    where id not in (select fiche_id from public.fiches_recherche) limit 100;

-- ─── 3. Classement des élèves (CRM pédagogique) ───────────────────────────
-- Mêmes définitions que admin_crm_activity (vidéo vue = drapeau du lecteur OU
-- émargement signé), plus les QUESTIONS répondues (une série peut compter 1
-- ou 60 questions). `p_depuis` borne la période ; les vidéos et fiches du
-- lecteur n'ont pas de date propre et sont datées par la dernière visite de
-- l'item (approximation documentée dans l'interface).
create or replace function public.admin_crm_classement(p_faculte_id text, p_depuis timestamptz default null)
returns table (
  user_id uuid,
  videos integer,
  questions integer,
  series integer,
  fiches integer,
  flashcards integer,
  last_activity timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with eleves as (
    select p.id from public.profiles p where p.role = 'student' and p.faculte_id = p_faculte_id
  ),
  vids as (
    select u.user_id, count(*) as n
    from (
      select cp.user_id, cp.cours_id, 'video'::text as kind
        from public.course_progress cp
       where cp.video_watched and (p_depuis is null or cp.last_seen_at >= p_depuis)
      union
      select ca.user_id, ca.cours_id, ca.kind
        from public.course_attendances ca
       where ca.signed_at is not null and (p_depuis is null or ca.signed_at >= p_depuis)
    ) u
    where u.user_id in (select id from eleves)
    group by u.user_id
  ),
  fic as (
    select cp.user_id, count(*) filter (where cp.fiche_read) as n, max(cp.last_seen_at) as last_seen
      from public.course_progress cp
     where cp.user_id in (select id from eleves)
       and (p_depuis is null or cp.last_seen_at >= p_depuis)
     group by cp.user_id
  ),
  att as (
    select qa.user_id, count(distinct qa.question_id) as n, max(qa.attempted_at) as last_at
      from public.qcm_attempts qa
     where qa.user_id in (select id from eleves)
       and (p_depuis is null or qa.attempted_at >= p_depuis)
     group by qa.user_id
  ),
  ser as (
    select qs.user_id, count(*) as n
      from public.qcm_sessions qs
     where qs.finished_at is not null
       and qs.user_id in (select id from eleves)
       and (p_depuis is null or qs.finished_at >= p_depuis)
     group by qs.user_id
  ),
  fla as (
    select fr.user_id, count(*) as n, max(fr.reviewed_at) as last_at
      from public.flashcard_reviews fr
     where fr.user_id in (select id from eleves)
       and (p_depuis is null or fr.reviewed_at >= p_depuis)
     group by fr.user_id
  )
  select e.id,
         coalesce(vids.n, 0)::int,
         coalesce(att.n, 0)::int,
         coalesce(ser.n, 0)::int,
         coalesce(fic.n, 0)::int,
         coalesce(fla.n, 0)::int,
         greatest(fic.last_seen, att.last_at, fla.last_at)
    from eleves e
    left join vids on vids.user_id = e.id
    left join fic  on fic.user_id  = e.id
    left join att  on att.user_id  = e.id
    left join ser  on ser.user_id  = e.id
    left join fla  on fla.user_id  = e.id;
$$;
revoke all on function public.admin_crm_classement(text, timestamptz) from public, anon, authenticated;
grant execute on function public.admin_crm_classement(text, timestamptz) to service_role;
