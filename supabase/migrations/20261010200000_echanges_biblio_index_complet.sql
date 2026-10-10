-- Échanges — bibliothèque : l'index unique sur source_message_id était PARTIEL
-- (« where source_message_id is not null »). Un upsert ON CONFLICT
-- (source_message_id) ne peut pas s'appuyer sur un index partiel (erreur
-- 42P10) : « Transformer en réponse permanente » et le versement à
-- l'archivage échouaient. Un index unique simple suffit (les NULL restent
-- distincts entre eux).
drop index if exists public.echanges_biblio_source_uidx;
create unique index if not exists echanges_biblio_source_uidx on public.echanges_bibliotheque (source_message_id);
