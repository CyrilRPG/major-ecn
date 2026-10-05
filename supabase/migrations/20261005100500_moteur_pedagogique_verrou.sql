-- Moteur pédagogique central : verrou de traitement par candidat.
--
-- Le traitement d'un lot de signaux lit puis réécrit l'état des items : deux
-- traitements simultanés pour le même candidat (collecte depuis le tableau de
-- bord + fin de Check-up) ne doivent pas s'entrelacer. PostgREST ne tient pas
-- de transaction entre deux appels : un bail court (`lock_until`) posé par une
-- mise à jour conditionnelle atomique fait office de verrou.

alter table public.pedago_collector_state
  add column if not exists lock_until  timestamptz,
  add column if not exists lock_owner  text;

-- Prise du verrou : renvoie true si le bail est obtenu (ou renouvelé par le même propriétaire).
create or replace function public.pedago_try_lock(p_user uuid, p_owner text, p_seconds int default 60)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  ok boolean;
begin
  insert into public.pedago_collector_state (user_id) values (p_user) on conflict (user_id) do nothing;
  update public.pedago_collector_state
     set lock_until = now() + make_interval(secs => greatest(5, least(p_seconds, 600))), lock_owner = p_owner
   where user_id = p_user and (lock_until is null or lock_until < now() or lock_owner = p_owner)
  returning true into ok;
  return coalesce(ok, false);
end;
$$;

create or replace function public.pedago_unlock(p_user uuid, p_owner text)
returns void
language sql
security definer
set search_path to 'public'
as $$
  update public.pedago_collector_state set lock_until = null, lock_owner = null where user_id = p_user and lock_owner = p_owner;
$$;

do $$
declare f text;
begin
  foreach f in array array['public.pedago_try_lock(uuid, text, int)', 'public.pedago_unlock(uuid, text)']
  loop
    execute format('revoke all on function %s from public', f);
    execute format('revoke all on function %s from anon', f);
    execute format('revoke all on function %s from authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
