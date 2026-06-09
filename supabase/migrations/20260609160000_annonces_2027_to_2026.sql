-- =============================================================================
-- Migration : remplace les dates 2027 par 2026 dans les annonces existantes
-- =============================================================================
-- Met à jour les annonces stockées en DB qui contiennent encore "2027" dans
-- leur titre ou dans leur JSON data (countdown.target_date, event_list.events[].date)

update public.announcements
   set title = replace(title, '2027', '2026')
 where title ilike '%2027%';

-- Pour les annonces countdown : remplacer target_date
update public.announcements
   set data = jsonb_set(
     data,
     '{target_date}',
     to_jsonb(replace(data->>'target_date', '2027', '2026'))
   )
 where kind = 'countdown'
   and data->>'target_date' like '%2027%';

-- Pour les annonces event_list : remplacer date dans chaque event
update public.announcements
   set data = jsonb_set(
     data,
     '{events}',
     (
       select coalesce(jsonb_agg(
         case
           when ev->>'date' like '%2027%'
             then jsonb_set(ev, '{date}', to_jsonb(replace(ev->>'date', '2027', '2026')))
           else ev
         end
       ), '[]'::jsonb)
       from jsonb_array_elements(data->'events') ev
     )
   )
 where kind = 'event_list'
   and data->'events' @> '[{"date":""}]'::jsonb
   and (
     select bool_or(ev->>'date' like '%2027%')
       from jsonb_array_elements(data->'events') ev
   );

-- Vérification
do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.announcements
   where title ilike '%2027%'
      or data::text like '%2027%';
  if v_count > 0 then
    raise notice 'Il reste % annonce(s) avec 2027 — à vérifier manuellement.', v_count;
  else
    raise notice 'OK — aucune annonce ne contient plus 2027.';
  end if;
end $$;
