-- Formule Essentielle : accès à la fiche de cours exhaustive.
--
-- Jusqu'ici l'Essentielle n'ouvrait que la fiche éclair (`fiche_express`). Elle
-- ouvre désormais aussi la fiche exhaustive (`fiche`), comme les pages de vente
-- le promettaient déjà (« Fiches & fiches éclair »). Même valeur que le repli
-- codé en dur getContentAccess('essentiel').
--
-- Borné à la faculté Major ECN : major-odonto et major-pha gardent leur
-- configuration.
--
-- Idempotent : ne fait rien si la ligne est déjà correcte.

update public.formula_permissions
set fiche = true, updated_at = now()
where faculte_id = 'major-ecn' and offer = 'essentiel' and fiche is distinct from true;
