-- Correction du bonus Gériatrie → Médecine générale (suite à 20260805150000).
--
-- La policy précédente (qcm_series_geriatrie_mg_qroc_only) forçait kind='qroc'
-- pour TOUS les élèves Gériatrie sur leur accès bonus MG, ce qui cassait la
-- règle normale voie interne → QCM / voie externe → QROC (déjà appliquée
-- globalement par qcm_series_voie_restrict, kind-based).
--
-- Comportement voulu : la voie de l'élève continue de trancher QCM vs QROC
-- comme partout ailleurs (aucune policy dédiée nécessaire, qcm_series_voie_restrict
-- s'en charge déjà). Ce qui doit être bloqué EN PLUS, spécifiquement sur l'accès
-- bonus MG des élèves Gériatrie : les dossiers progressifs (DP, qu'ils soient
-- QCM ou QROC — identifiés par le libellé, comme partout ailleurs dans le code,
-- cf. qcm/page.tsx `isDp`/`isDpQroc`), les séries « entraînement », et les
-- séances du professeur (type='seance').

drop policy if exists qcm_series_geriatrie_mg_qroc_only on public.qcm_series;

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
      and qcm_series.label !~* '^dp'
    )
  );
