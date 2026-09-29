-- Avatars : les 320 portraits peints (29/09/2026).
--
-- Un avatar n'est plus un médaillon composé (`c1-…`) mais l'un des trois cent
-- vingt portraits découpés dans les planches fournies par Major ECN, choisi
-- trait par trait (profil, teint, visage, cheveux, coiffure, barbe,
-- accessoires, tenue, expression, fond). Code : `av-NNN` — voir
-- `src/lib/avatars/portraits.ts` et `catalogue.ts`.
--
-- Quatre effets :
--   1. Major ECN n'impose PLUS d'unicité : plusieurs comptes peuvent porter
--      le même portrait (index `profiles_avatar_compose_unique` supprimé).
--   2. EVC Arena la garde, tournoi par tournoi. Au-delà de 320 participants
--      dans un même tournoi, le même portrait reçoit un code distinct
--      (`av-NNN-xxxx`) : personne n'est refusé.
--   3. Chaque compte Major ECN reçoit un portrait tiré au hasard.
--   4. Chaque participant EVC Arena aussi, sans doublon dans son tournoi.
--
-- Rejouable : les tirages ne portent que sur les graines qui ne sont pas
-- encore des portraits.
begin;

-- 0. Fonctions ---------------------------------------------------------------

create or replace function public.avatar_portrait_valide(seed text)
returns boolean language sql immutable set search_path = public as $$
  select coalesce(seed ~ '^av-[0-9]{3}(-[0-9a-z]{4})?$'
                  and substr(seed, 4, 3)::int between 1 and 320, false);
$$;

create or replace function public.avatar_portrait_aleatoire()
returns text language sql volatile set search_path = public as $$
  select 'av-' || lpad((1 + floor(random() * 320))::int::text, 3, '0');
$$;

-- 1. Profils Major ECN -------------------------------------------------------

drop index if exists public.profiles_avatar_compose_unique;
alter table public.profiles drop constraint if exists profiles_major_ecn_avatar_catalog;

-- Côté plateforme, jamais de suffixe : il n'y a pas d'unicité à préserver.
create or replace function public.major_ecn_avatar_valide(seed text)
returns boolean language sql immutable set search_path = public as $$
  select coalesce(seed ~ '^av-[0-9]{3}$' and public.avatar_portrait_valide(seed), false);
$$;

create or replace function public.major_ecn_random_avatar()
returns text language sql volatile set search_path = public as $$
  select public.avatar_portrait_aleatoire();
$$;

-- Le déclencheur `major_ecn_assign_avatar` (09/09/2026) remplace toute graine
-- invalide par `major_ecn_random_avatar()` : il suit ces nouvelles définitions.

update public.profiles
   set avatar_seed = public.avatar_portrait_aleatoire()
 where faculte_id = 'major-ecn'
   and not public.major_ecn_avatar_valide(avatar_seed);

alter table public.profiles add constraint profiles_major_ecn_avatar_catalog
  check (faculte_id is distinct from 'major-ecn'
    or public.major_ecn_avatar_valide(avatar_seed));

-- 2. Participants EVC Arena ----------------------------------------------------

drop index if exists public.arena_participants_avatar_unique;

-- `arena_keep_avatar_identity` interdit toute modification de `avatar_seed`
-- (« Le personnage choisi est conservé pendant toute l'Arena »). La règle
-- reste vraie pour l'application ; on la suspend le temps de cette reprise
-- unique. Tout est dans une transaction : un échec rétablit le déclencheur.
do $$
begin
  if exists (select 1 from pg_trigger
             where tgrelid = 'public.arena_participants'::regclass
               and tgname = 'arena_keep_avatar_identity') then
    alter table public.arena_participants disable trigger arena_keep_avatar_identity;
  end if;
end;
$$;

-- Un tirage sans remise par tournoi : les portraits déjà valides sont
-- retirés de l'urne, puis chacun reçoit le suivant d'une permutation
-- aléatoire du catalogue.
do $$
declare
  tournoi record;
  ligne record;
  urne text[];
  rang int;
begin
  for tournoi in
    select distinct tournament_id from public.arena_participants
    where not public.avatar_portrait_valide(avatar_seed)
  loop
    urne := array(
      select 'av-' || lpad(n::text, 3, '0')
      from generate_series(1, 320) as n
      where 'av-' || lpad(n::text, 3, '0') not in (
        select avatar_seed from public.arena_participants
        where tournament_id = tournoi.tournament_id and anonymized_at is null
          and public.avatar_portrait_valide(avatar_seed))
      order by random());
    rang := 0;
    for ligne in
      select id from public.arena_participants
      where tournament_id = tournoi.tournament_id
        and not public.avatar_portrait_valide(avatar_seed)
      order by anonymized_at nulls first, created_at, id
    loop
      rang := rang + 1;
      update public.arena_participants
         set avatar_seed = case
           when rang <= cardinality(urne) then urne[rang]
           -- Tournoi plus peuplé que le catalogue : même image, code distinct.
           else public.avatar_portrait_aleatoire() || '-' || substr(md5(ligne.id::text), 1, 4)
         end
       where id = ligne.id;
    end loop;
  end loop;
end;
$$;

do $$
begin
  if exists (select 1 from pg_trigger
             where tgrelid = 'public.arena_participants'::regclass
               and tgname = 'arena_keep_avatar_identity') then
    alter table public.arena_participants enable trigger arena_keep_avatar_identity;
  end if;
end;
$$;

-- Un participant anonymisé n'a plus d'identité : son portrait redevient libre.
create unique index if not exists arena_participants_avatar_unique
  on public.arena_participants (tournament_id, avatar_seed)
  where anonymized_at is null and avatar_seed like 'av-%';

-- 3. Fonctions des médaillons composés, désormais sans usage -----------------

drop function if exists public.medaillon_aleatoire(int, boolean);
drop function if exists public.avatar_embleme_aleatoire(boolean);
drop function if exists public.avatar_portrait_aleatoire(boolean);
drop function if exists public.avatar_portrait_de_code(text);
drop function if exists public.avatar_portrait_index(text);
drop function if exists public.est_avatar_compose(text);
drop function if exists public.avatar_char(int);

notify pgrst, 'reload schema';
commit;
