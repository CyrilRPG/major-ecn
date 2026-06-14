-- =============================================================================
-- Migration : renommer l'admin "Hermione" en "Major ECN" pour qu'il s'affiche
--             "Admin Major ECN" partout (forum, messagerie, etc.).
-- =============================================================================

update public.profiles
   set first_name = 'Admin',
       last_name  = 'Major ECN'
 where role = 'admin'
   and (
        coalesce(last_name, '') ilike '%hermione%'
     or coalesce(first_name, '') ilike '%hermione%'
   );

do $$
declare v_count int;
begin
  select count(*) into v_count
    from public.profiles
   where role = 'admin'
     and first_name = 'Admin'
     and last_name  = 'Major ECN';
  raise notice 'Comptes admin renommés "Admin Major ECN" : %.', v_count;
end $$;
