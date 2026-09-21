-- Médaillons composés (21/09/2026).
--
-- Un avatar n'est plus un portrait choisi dans une planche de 24 images mais
-- une COMBINAISON : le portrait (inchangé, ce sont les mêmes fichiers) plus le
-- champ, le motif, le cadre, le métal, le liseré et l'emblème. Le tout est
-- encodé dans `avatar_seed` : `c1-` suivi d'un caractère base 36 par
-- emplacement (7 emplacements). Voir `src/lib/avatars/traits.ts` — l'ordre des
-- emplacements y est figé :
--
--     portrait · fond · motif · cadre · couleurCadre · liseré · emblème
--        24       10      6       8         10           6        8
--
-- Quatre effets :
--   1. `profiles` accepte ces codes. La contrainte et le déclencheur posés le
--      09/09/2026 remplaçaient TOUT identifiant hors planche par un tirage :
--      sans cette migration, chaque médaillon composé serait écrasé en silence
--      à l'enregistrement.
--   2. Deux comptes Major ECN ne portent jamais le même médaillon.
--   3. Deux participants d'un même tournoi EVC Arena non plus.
--   4. Les avatars existants sont repris : chacun GARDE SON VISAGE, seuls les
--      ornements sont tirés au sort (§4).
--
-- Les deux unicités sont CLOISONNÉES : elles vivent sur deux tables et deux
-- index distincts. Le même médaillon peut donc exister à la fois sur un compte
-- Major ECN et sur un participant d'Arena — ce sont deux mondes séparés.
--
-- Les index sont PARTIELS (`like 'c1-%'`) : les portraits de l'ancienne
-- planche, s'il en reste, ne sont pas concernés et personne ne perd son avatar.
begin;

-- 0. Petites fonctions de codage ---------------------------------------------

-- Caractère base 36 d'un indice d'emplacement.
create or replace function public.avatar_char(indice int)
returns text language sql immutable set search_path = public as $$
  select substr('0123456789abcdefghijklmnopqrstuvwxyz', indice + 1, 1);
$$;

create or replace function public.est_avatar_compose(seed text)
returns boolean language sql immutable set search_path = public as $$
  select seed ~ '^c1-[0-9a-z]{7}$';
$$;

-- Index d'un portrait dans la planche (`AVATARS_PLANCHE`, ordre figé) :
-- 0 casque · 1..17 medecin-01..17 · 18 lion · 19 hibou · 20 statue
-- 21 caducee · 22 livre · 23 sommet. NULL si la graine n'est pas un portrait.
create or replace function public.avatar_portrait_index(seed text)
returns int language sql immutable set search_path = public as $$
  select case
    when seed = 'casque' then 0
    when seed ~ '^medecin-(0[1-9]|1[0-7])$' then substr(seed, 9)::int
    when seed = 'lion' then 18
    when seed = 'hibou' then 19
    when seed = 'statue' then 20
    when seed = 'caducee' then 21
    when seed = 'livre' then 22
    when seed = 'sommet' then 23
    else null
  end;
$$;

-- Portrait porté par un médaillon composé (premier emplacement du code).
create or replace function public.avatar_portrait_de_code(seed text)
returns int language sql immutable set search_path = public as $$
  select case when public.est_avatar_compose(seed)
    then strpos('0123456789abcdefghijklmnopqrstuvwxyz', substr(seed, 4, 1)) - 1
  end;
$$;

-- Le gladiateur (portrait 0, emblème 1) est réservé à EVC Arena.
create or replace function public.avatar_portrait_aleatoire(arena boolean)
returns int language sql volatile set search_path = public as $$
  select case when arena then floor(random() * 24)::int
              else 1 + floor(random() * 23)::int end;
$$;

-- Hors Arena, les valeurs permises sont 0 (aucun emblème) et 2..7 : sept
-- choix, avec un trou en 1. Un simple intervalle ne suffit donc pas.
create or replace function public.avatar_embleme_aleatoire(arena boolean)
returns int language sql volatile set search_path = public as $$
  select case
    when arena then floor(random() * 8)::int
    else (select case when tirage = 0 then 0 else tirage + 1 end
          from (select floor(random() * 7)::int as tirage) as t)
  end;
$$;

-- Médaillon aléatoire pour un portrait imposé.
create or replace function public.medaillon_aleatoire(portrait int, arena boolean)
returns text language sql volatile set search_path = public as $$
  select 'c1-'
      || public.avatar_char(portrait)
      || public.avatar_char(floor(random() * 10)::int)  -- fond
      || public.avatar_char(floor(random() * 6)::int)   -- motif
      || public.avatar_char(floor(random() * 8)::int)   -- cadre
      || public.avatar_char(floor(random() * 10)::int)  -- métal du cadre
      || public.avatar_char(floor(random() * 6)::int)   -- liseré
      || public.avatar_char(public.avatar_embleme_aleatoire(arena));
$$;

-- 1. Profils Major ECN -------------------------------------------------------

-- Immuable : la fonction sert dans une contrainte CHECK, qui n'accepte pas de
-- dépendre d'un résultat variable dans le temps.
create or replace function public.major_ecn_avatar_valide(seed text)
returns boolean language sql immutable set search_path = public as $$
  select coalesce(public.est_avatar_compose(seed)
                  or seed = any(public.major_ecn_avatar_ids()), false);
$$;

-- Un médaillon composé est désormais le tirage par défaut.
create or replace function public.major_ecn_random_avatar()
returns text language sql volatile set search_path = public as $$
  select public.medaillon_aleatoire(public.avatar_portrait_aleatoire(false), false);
$$;

create or replace function public.major_ecn_assign_avatar()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.faculte_id = 'major-ecn'
     and not public.major_ecn_avatar_valide(new.avatar_seed) then
    new.avatar_seed := public.major_ecn_random_avatar();
  end if;
  return new;
end;
$$;

-- La contrainte de 09/2026 n'acceptait que la planche : la remplacer. Les
-- lignes existantes portent toutes un identifiant de la planche, donc valide —
-- la contrainte est posée validée, et doit échouer bruyamment si ce n'était
-- pas le cas.
alter table public.profiles drop constraint if exists profiles_major_ecn_avatar_catalog;
alter table public.profiles add constraint profiles_major_ecn_avatar_catalog
  check (faculte_id is distinct from 'major-ecn'
    or public.major_ecn_avatar_valide(avatar_seed));

-- 2. Unicité côté Major ECN --------------------------------------------------

create unique index if not exists profiles_avatar_compose_unique
  on public.profiles (avatar_seed)
  where faculte_id = 'major-ecn' and avatar_seed like 'c1-%';

-- 3. Unicité côté EVC Arena, tournoi par tournoi ------------------------------

-- Un participant anonymisé n'a plus d'identité : son médaillon redevient libre.
create unique index if not exists arena_participants_avatar_unique
  on public.arena_participants (tournament_id, avatar_seed)
  where anonymized_at is null and avatar_seed like 'c1-%';

-- 4. Reprise des avatars existants --------------------------------------------
--
-- Chacun GARDE LE VISAGE qu'il a déjà ; seuls les ornements (champ, motif,
-- cadre, métal, liseré, emblème) sont tirés au sort. Personne ne découvre un
-- inconnu à la place de son portrait.
--
-- L'unicité est obtenue par tirages successifs : chaque portrait dispose de
-- 230 400 habillages, la collision est rare et la boucle la rejoue. Le visage,
-- lui, n'est jamais rejoué.

-- 4.1 Comptes Major ECN ------------------------------------------------------

do $$
declare
  ligne record;
  essai int;
  code text;
  portrait int;
begin
  for ligne in
    select id, avatar_seed from public.profiles
    where faculte_id = 'major-ecn' and coalesce(avatar_seed, '') not like 'c1-%'
    order by id
  loop
    -- Le gladiateur n'existe pas côté plateforme, et un compte sans choix n'a
    -- pas de visage à conserver : on en tire un parmi les 23 autorisés.
    portrait := public.avatar_portrait_index(ligne.avatar_seed);
    if portrait is null or portrait = 0 then
      portrait := public.avatar_portrait_aleatoire(false);
    end if;

    for essai in 1..80 loop
      code := public.medaillon_aleatoire(portrait, false);
      begin
        update public.profiles set avatar_seed = code where id = ligne.id;
        exit;
      exception when unique_violation then
        -- Habillage déjà porté : on rejoue les ornements, jamais le visage.
        if essai = 80 then raise; end if;
      end;
    end loop;
  end loop;
end;
$$;

-- 4.2 Participants EVC Arena -------------------------------------------------
--
-- Les graines procédurales historiques (« k3f9x2a1 ») ne désignent aucun
-- portrait : jusqu'ici l'application allait chercher celui du compte Major ECN
-- de même adresse. On fige ici ce même visage, puisque c'est celui que la
-- personne voit — après quoi les deux mondes sont définitivement cloisonnés.

do $$
declare
  ligne record;
  essai int;
  code text;
  portrait int;
begin
  for ligne in
    select p.id, p.avatar_seed,
           public.avatar_portrait_de_code(prof.avatar_seed) as portrait_profil
    from public.arena_participants p
    left join public.profiles prof
      on p.faculte_id = 'major-ecn'
     and prof.faculte_id = 'major-ecn'
     and lower(btrim(prof.email)) = lower(btrim(p.email))
    where p.anonymized_at is null
      and coalesce(p.avatar_seed, '') not like 'c1-%'
    order by p.id
  loop
    portrait := coalesce(
      public.avatar_portrait_index(ligne.avatar_seed),
      ligne.portrait_profil,
      public.avatar_portrait_aleatoire(true)
    );

    for essai in 1..80 loop
      code := public.medaillon_aleatoire(portrait, true);
      begin
        update public.arena_participants set avatar_seed = code where id = ligne.id;
        exit;
      exception when unique_violation then
        if essai = 80 then raise; end if;
      end;
    end loop;
  end loop;
end;
$$;

notify pgrst, 'reload schema';
commit;
