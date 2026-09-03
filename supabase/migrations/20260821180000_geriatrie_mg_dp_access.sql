-- Ouvre l'accès aux DP « Gériatrie » sur les cours MG bonus pour les élèves
-- Gériatrie, tout en les cachant aux élèves Médecine générale classiques.
--
-- Convention de label : les séries gériatriques portent « Gériatrie » dans le
-- libellé (ex. « DP Gériatrie 1 . Pneumonie du sujet âgé »).
--
-- Deux modifications :
--  1. Policy existante qcm_series_geriatrie_mg_block_dp_entrainement_seance :
--     on ajoute une exception pour les DP dont le label contient « gériatrie ».
--  2. Nouvelle policy restrictive : les séries dont le label contient
--     « gériatrie » sur un cours MG ne sont visibles qu'aux élèves Gériatrie.

-- 1) Remplacement de la policy existante pour laisser passer les DP gériatriques
drop policy if exists qcm_series_geriatrie_mg_block_dp_entrainement_seance on public.qcm_series;

create policy qcm_series_geriatrie_mg_block_dp_entrainement_seance
  on public.qcm_series
  as restrictive
  for select
  to public
  using (
    ("current_role"() is distinct from 'student')
    or (not public.current_is_geriatrie())
    or not exists (
      select 1 from public.cours c
      join public.matieres m on m.id = c.matiere_id
      where c.id = qcm_series.cours_id
        and (m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale')
    )
    or (
      qcm_series.type is distinct from 'seance'
      and qcm_series.label !~* 'entra[iî]nement'
      and (qcm_series.label !~* '^dp' or qcm_series.label ~* 'g[eé]riatrie')
    )
  );

-- 2) Les séries « gériatrie » sur cours MG sont réservées aux élèves Gériatrie
create policy qcm_series_geriatrie_only_mg_dp
  on public.qcm_series
  as restrictive
  for select
  to public
  using (
    ("current_role"() is distinct from 'student')
    or (not qcm_series.mg_series)
    or (qcm_series.label !~* 'g[eé]riatrie')
    or public.current_is_geriatrie()
  );
