-- La production ne comportait plus l'exemption des annales de la règle de voie,
-- pourtant prévue par 20260823100000 et 20260903170000 et par le code applicatif.
-- Restaurer cette seule exemption en conservant les autres critères réellement
-- déployés. La restriction de publication reste indépendante et prioritaire.
do $migration$
declare
  existing_filter text;
begin
  select qual into existing_filter
  from pg_policies
  where schemaname = 'public'
    and tablename = 'qcm_series'
    and policyname = 'qcm_series_voie_restrict';

  if existing_filter is null then
    raise exception 'La politique de voie attendue est absente';
  end if;

  if position('annales?' in existing_filter) = 0 then
    execute format(
      'alter policy qcm_series_voie_restrict on public.qcm_series using ((%s) or label ~* %L)',
      existing_filter,
      '^annales?\y'
    );
  end if;
end;
$migration$;
