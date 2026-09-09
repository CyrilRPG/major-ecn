-- Major ECN : catalogue Arena sans le gladiateur, attribution aléatoire initiale.
-- Ne modifie ni les participants Arena ni les profils des autres facultés.
begin;

alter table public.profiles add column if not exists avatar_seed text;

create or replace function public.major_ecn_avatar_ids()
returns text[] language sql immutable set search_path = public as $$
  select array[
    'medecin-01', 'medecin-02', 'medecin-03', 'medecin-04', 'medecin-05',
    'medecin-06', 'medecin-07', 'medecin-08', 'medecin-09', 'medecin-10',
    'medecin-11', 'medecin-12', 'medecin-13', 'medecin-14', 'medecin-15',
    'medecin-16', 'medecin-17', 'lion', 'hibou', 'statue', 'caducee', 'livre', 'sommet'
  ]::text[];
$$;

create or replace function public.major_ecn_random_avatar()
returns text language sql volatile set search_path = public as $$
  select (public.major_ecn_avatar_ids())[1 + floor(random() * cardinality(public.major_ecn_avatar_ids()))::int];
$$;

-- L'ancien client peut encore transmettre une graine procédurale : la remplacer
-- par un choix autorisé, sans écraser un choix valide lors d'une autre mise à jour.
create or replace function public.major_ecn_assign_avatar()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.faculte_id = 'major-ecn'
     and not coalesce(new.avatar_seed = any(public.major_ecn_avatar_ids()), false) then
    new.avatar_seed := public.major_ecn_random_avatar();
  end if;
  return new;
end;
$$;

drop trigger if exists major_ecn_assign_avatar on public.profiles;
create trigger major_ecn_assign_avatar
  before insert or update of avatar_seed, faculte_id on public.profiles
  for each row execute function public.major_ecn_assign_avatar();

-- La contrainte sert aussi de garde au rejeu : le reset autorisé n'a lieu qu'une fois.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass and conname = 'profiles_major_ecn_avatar_catalog'
  ) then
    update public.profiles set avatar_seed = public.major_ecn_random_avatar()
    where faculte_id = 'major-ecn';

    alter table public.profiles add constraint profiles_major_ecn_avatar_catalog
      check (faculte_id is distinct from 'major-ecn'
        or coalesce(avatar_seed = any(public.major_ecn_avatar_ids()), false));
  end if;
end;
$$;

notify pgrst, 'reload schema';
commit;
