-- =============================================================================
-- Migration : pointer le bouton "Accéder à mon espace CNG" vers
--             https://www.cng.sante.fr/session-evc-2026
-- =============================================================================
-- Met à jour les annonces de type "info" dont le libellé du bouton est
-- "Accéder à mon espace CNG" pour pointer vers le bon URL CNG (session EVC 2026)
-- et forcer l'ouverture en nouvel onglet (lien externe).

update public.announcements
   set data = jsonb_set(
     jsonb_set(
       data,
       '{cta_href}',
       to_jsonb('https://www.cng.sante.fr/session-evc-2026'::text)
     ),
     '{cta_external}',
     to_jsonb(true)
   )
 where kind = 'info'
   and data->>'cta_label' ilike '%espace CNG%';

-- Vérification
do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.announcements
   where kind = 'info'
     and data->>'cta_label' ilike '%espace CNG%'
     and data->>'cta_href' = 'https://www.cng.sante.fr/session-evc-2026';
  raise notice 'Annonces "Accéder à mon espace CNG" mises à jour : %.', v_count;
end $$;
